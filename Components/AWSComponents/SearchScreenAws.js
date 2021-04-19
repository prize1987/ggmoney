import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  FlatList,
  Modal,
  TouchableWithoutFeedback,
  Keyboard,
  AsyncStorage,
} from 'react-native';
import {Item, Label, Input, Icon, ListItem, Picker} from 'native-base';
import CustomButton from '../CustomButton';
import Toast from 'react-native-root-toast';
import StoreInfoModal from '../StoreInfoModal';
import AWSApi from '../AWSApi';

const indutypeList = [
  '전체',
  '음식점',
  '유통/편의점',
  '제과/음료식품',
  '숙박',
  '미용/안경/보건위생',
  '문화/취미',
  '여행',
  '레저',
  '의류/잡화/생활가전',
  '주유소',
  '자동차판매/정비',
  '서적/문구',
  '학원',
  '사무통신',
  '서비스',
  '병원',
  '약국',
  '기타 의료기관',
  '보험',
  '기타',
];

class SearchScreenAws extends React.Component {
  static defaultProps = {numToRender: 20};
  state = {
    indutypeCon: '',
    searchCon: '',
    api: null,
    data: [],
    fetchCnt: 0,
    totalCnt: 0,
    isLoaded: false,
    modalOpen: false,
    selectedItem: {},
    selectedSiguns: null,
  };

  constructor(props) {
    super(props);

    this.state.api = new AWSApi();
  }

  async componentDidMount() {
    await this.state.api.initConnectionInfo();
    this.loadLastStatus();

    // this.getInitData();
    // console.log(this.props.numToRender);
  }

  showToast(msg, dur = Toast.durations.LONG, pos = Toast.positions.BOTTOM) {
    Toast.show(msg, {
      duration: dur,
      position: pos,
      shadow: true,
      animation: true,
      hideOnPress: true,
    });
  }

  loadLastStatus = async () => {
    const selectedSiguns = await AsyncStorage.getItem('selectedSiguns');
    if (selectedSiguns === null) {
      this.props.callOption();
    } else {
      this.setState({selectedSiguns: selectedSiguns});
    }

    const isSave = await AsyncStorage.getItem('isSave');
    let searchCon = await AsyncStorage.getItem('lastSearchCon');
    if (isSave === 'true') {
      if (searchCon === null) {
        searchCon = '';
      }

      this.setState({searchCon: searchCon});
      this.getInitData();
    } else {
      this.getInitData();
    }
  };

  async getInitData() {
    const {numToRender} = this.props;
    const {indutypeCon, searchCon, api, selectedSiguns} = this.state;
    // console.log(indutypeCon);

    if (searchCon === '수진아사랑해행복하자') {
      AsyncStorage.setItem('adOff', 'true');
      this.showToast('광고 끔', Toast.durations.SHORT, Toast.positions.CENTER);
      return;
    }
    if (searchCon === '몽이순산기원') {
      AsyncStorage.setItem('adOff', 'false');
      this.showToast('광고 켬', Toast.durations.SHORT, Toast.positions.CENTER);
      return;
    }

    AsyncStorage.setItem('lastSearchCon', searchCon);

    this.setState({isLoaded: false});

    let totalCnt = await api.getStoreInfoCount(
      selectedSiguns,
      indutypeCon,
      searchCon,
    );
    let recvData = await api.getStoreInfo(
      selectedSiguns,
      indutypeCon,
      searchCon,
      0,
      numToRender,
    );

    this.showToast(
      totalCnt + '건 조회',
      Toast.durations.SHORT,
      Toast.positions.BOTTOM - 160,
    );

    this.setState({
      data: recvData,
      fetchCnt: recvData.length,
      totalCnt: totalCnt,
      isLoaded: true,
    });
  }
  async getMoreData() {
    const {numToRender} = this.props;
    const {
      indutypeCon,
      searchCon,
      data,
      fetchCnt,
      api,
      selectedSiguns,
    } = this.state;

    let recvData = await api.getStoreInfo(
      selectedSiguns,
      indutypeCon,
      searchCon,
      fetchCnt,
      numToRender,
    );

    this.setState({
      data: [...data, ...recvData],
      fetchCnt: fetchCnt + recvData.length,
      // isLoaded: true,
    });
  }

  onEndReached = () => {
    const {fetchCnt, totalCnt} = this.state;

    if (fetchCnt < totalCnt) {
      this.getMoreData();
    }
  };

  onIndutypeChange = value => {
    this.setState({indutypeCon: value}, this.getInitData);
  };

  render() {
    const {numToRender} = this.props;
    const {data, isLoaded, modalOpen} = this.state;

    return (
      <>
        <Modal
          animationType="fade"
          transparent={true}
          visible={modalOpen}
          onRequestClose={() => {
            console.log('Modal has been closed.');
          }}>
          <StoreInfoModal
            item={this.state.selectedItem}
            onClose={() => {
              this.setState({modalOpen: !modalOpen});
            }}
            showToast={this.showToast}
            callMapSearch={this.props.callMapSearch}
            mapButtonEnabled={true}
          />
        </Modal>

        <View style={styles.searchContainer}>
          {/* <Item picker> */}
          <View style={{justifyContent: 'center'}}>
            <Picker
              mode="dropdown"
              iosIcon={<Icon name="keyboard-arrow-down" type="MaterialIcons" />}
              style={{width: 100}}
              placeholder="업종"
              placeholderStyle={{color: 'grey'}}
              // placeholderIconColor="grey"
              selectedValue={this.state.indutypeCon}
              // onValueChange={value => {
              //   this.setState({indutypeCon: value});
              // }}
              onValueChange={this.onIndutypeChange}>
              {indutypeList.map(indutype => {
                return <Picker.item label={indutype} value={indutype} />;
              })}
            </Picker>
          </View>
          {/* </Item> */}
          <Item style={styles.textInput} inlineLabel>
            <Label>
              <Icon style={styles.icon} name="search" type="MaterialIcons" />
            </Label>
            <Input
              placeholder="키워드 검색 (띄어쓰기로 구분)"
              onChangeText={text => {
                this.setState({searchCon: text});
              }}
              value={this.state.searchCon}
              onSubmitEditing={() => this.getInitData()}
              returnKeyType="search"
            />
            <TouchableWithoutFeedback
              onPress={() => {
                this.setState({searchCon: ''});
              }}>
              <Icon
                name="cancel"
                style={styles.clearTextButton}
                type="MaterialIcons"
              />
            </TouchableWithoutFeedback>
          </Item>
          <CustomButton
            title="검색"
            titleColor="white"
            buttonColor="#2788e5"
            onPress={() => {
              Keyboard.dismiss();
              this.getInitData();
            }}
          />
        </View>
        <View style={styles.listContainer}>
          {isLoaded ? (
            <FlatList
              style={styles.list}
              data={data}
              initialNumToRender={numToRender}
              onEndReachedThreshold={1}
              onEndReached={this.onEndReached}
              renderItem={({item}) => {
                return (
                  <ListItem style={{flex: 1}}>
                    <TouchableOpacity
                      style={styles.itemArea}
                      onPress={() => {
                        this.setState({modalOpen: true, selectedItem: item});
                      }}>
                      <Text style={styles.itemTitle}>{item.CMPNM_NM}</Text>
                      <Text style={styles.itemSub}>{item.INDUTYPE_NM}</Text>
                      <Text style={styles.itemSub}>
                        {item.REFINE_LOTNO_ADDR}
                      </Text>
                      <Text style={styles.itemSub}>
                        {item.REFINE_ROADNM_ADDR}
                      </Text>
                      <Text style={styles.itemSub}>{item.TELNO}</Text>
                      {/* <Text>{this.state.fetchCnt}</Text> */}
                    </TouchableOpacity>
                  </ListItem>
                );
              }}
            />
          ) : (
            <ActivityIndicator size={50} style={{marginTop: 50}} />
          )}
        </View>
      </>
    );
  }
}

const styles = StyleSheet.create({
  searchContainer: {
    height: 60,
    // backgroundColor: '#68dc68',
    alignContent: 'flex-end',
    justifyContent: 'space-around',
    // alignItems:''
    flexDirection: 'row',
    // paddingHorizontal: 10,
    // paddingVertical: 10,
  },
  textInput: {
    flex: 5,
    borderColor: 'gray',
    borderWidth: 1,
    backgroundColor: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 1,
    marginHorizontal: 1,
  },
  itemTitle: {
    fontSize: 19,
    fontWeight: 'bold',
  },
  itemSub: {
    fontSize: 13,
    color: '#595959',
  },
  itemArea: {
    flex: 1,
  },
  icon: {
    fontSize: 24,
    color: 'gray',
    // marginHorizontal:,
  },
  searchButton: {
    flex: 1,
    // width: 200,
    // fontSize: 24,
    alignItems: 'center',
    justifyContent: 'center',
    // paddingLeft: 200,
  },
  listContainer: {
    flex: 1,
    alignContent: 'stretch',
    // backgroundColor: '#2fd6c2',
  },
  list: {
    flex: 1,
    // backgroundColor: 'red',
    alignSelf: 'stretch',
  },
  clearTextButton: {
    fontSize: 20,
    color: 'gray',
  },
});

export default SearchScreenAws;
