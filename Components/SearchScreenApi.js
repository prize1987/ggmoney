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
} from 'react-native';
import {Item, Label, Input, Icon, ListItem} from 'native-base';
import ApiMain from './ApiMain';
import Toast from 'react-native-root-toast';

import StoreInfoModal from './StoreInfoModal';

class SearchScreenApi extends React.Component {
  static defaultProps = {numToRender: 50};
  state = {
    searchConName: '',
    searchConAddr: '',
    addrType: '',
    api: null,
    data: [],
    fetchCnt: 0,
    totalCnt: 0,
    nextIndex: 1,
    mode: 'start',
    modalOpen: false,
    selectedItem: {},
  };

  constructor(props) {
    super(props);

    this.state.api = new ApiMain();
  }

  componentDidMount() {
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

  async getInitData() {
    const {numToRender} = this.props;
    const {searchConName, searchConAddr, api} = this.state;

    this.setState({mode: 'loading'});

    let addrType = 'lotno';
    let totalCnt = await api.searchApiDataCount(
      searchConName,
      searchConAddr,
      addrType,
    );
    if (totalCnt === 0) {
      addrType = 'road';
      totalCnt = await api.searchApiDataCount(
        searchConName,
        searchConAddr,
        addrType,
      );
    }

    let recvData = await api.searchApiData(
      1,
      numToRender,
      searchConName,
      searchConAddr,
      addrType,
    );

    this.showToast(
      totalCnt + '건 조회',
      Toast.durations.SHORT,
      Toast.positions.BOTTOM,
    );

    this.setState({
      data: recvData,
      fetchCnt: recvData ? recvData.length : 0,
      totalCnt: totalCnt,
      addrType: addrType,
      nextIndex: 2,
      mode: 'loaded',
    });
  }
  async getMoreData() {
    const {numToRender} = this.props;
    const {
      searchConName,
      searchConAddr,
      addrType,
      data,
      fetchCnt,
      nextIndex,
      api,
    } = this.state;

    let recvData = await api.searchApiData(
      nextIndex,
      numToRender,
      searchConName,
      searchConAddr,
      addrType,
    );

    if (recvData !== null) {
      this.setState({
        data: [...data, ...recvData],
        fetchCnt: fetchCnt + recvData.length,
        nextIndex: nextIndex + 1,
      });
    }
  }

  onEndReached = () => {
    const {fetchCnt, totalCnt} = this.state;

    if (fetchCnt < totalCnt) {
      this.getMoreData();
    }
  };
  render() {
    const {numToRender} = this.props;
    const {data, mode, modalOpen} = this.state;

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
          <Item style={styles.textInput} inlineLabel>
            <Label>
              <Icon style={styles.icon} name="search" />
            </Label>
            <Input
              placeholder="이름으로 검색"
              onChangeText={text => {
                this.setState({searchConName: text});
              }}
              value={this.state.searchConName}
              onSubmitEditing={() => this.getInitData()}
              returnKeyType="search"
              clearButtonMode={true}
            />
            {this.state.searchConName.length > 0 ? (
              <TouchableWithoutFeedback
                onPress={() => {
                  this.setState({searchConName: ''});
                }}>
                <Icon name="md-close-circle" style={styles.clearTextButton} />
              </TouchableWithoutFeedback>
            ) : (
              <></>
            )}
          </Item>
          <Item style={styles.textInput} inlineLabel>
            <Label>
              <Icon style={styles.icon} name="search" />
            </Label>
            <Input
              placeholder="주소로 검색"
              onChangeText={text => {
                this.setState({searchConAddr: text});
              }}
              value={this.state.searchConAddr}
              onSubmitEditing={() => this.getInitData()}
              returnKeyType="search"
              clearButtonMode={true}
            />
            {this.state.searchConAddr.length > 0 ? (
              <TouchableWithoutFeedback
                onPress={() => {
                  this.setState({searchConAddr: ''});
                }}>
                <Icon name="md-close-circle" style={styles.clearTextButton} />
              </TouchableWithoutFeedback>
            ) : (
              <></>
            )}
          </Item>
        </View>
        <View style={styles.listContainer}>
          {mode === 'loaded' ? (
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
                    </TouchableOpacity>
                  </ListItem>
                );
              }}
            />
          ) : mode === 'loading' ? (
            <ActivityIndicator size={50} style={{marginTop: 50}} />
          ) : (
            <TouchableWithoutFeedback
              onPress={() => {
                Keyboard.dismiss();
              }}>
              <View>
                <Text style={styles.infoText}>검색어를 입력해주세요.</Text>
                <Text />
                <Text style={styles.infoSub}>
                  옵션 - 다운로드 방식 기능을 확인해보세요
                </Text>
                <Text style={styles.infoSub}>
                  보다 빠르고 편리한 검색이 가능합니다.
                </Text>
              </View>
            </TouchableWithoutFeedback>
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
    paddingHorizontal: 10,
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
    fontSize: 18,
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
    // alignContent: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    // backgroundColor: '#2fd6c2',
  },
  list: {
    flex: 1,
    // backgroundColor: 'red',
    alignSelf: 'stretch',
  },
  infoText: {
    fontSize: 18,
    alignSelf: 'center',
  },
  infoSub: {
    fontSize: 14,
    color: 'grey',
    alignSelf: 'center',
  },
  clearTextButton: {
    fontSize: 20,
    color: 'gray',
  },
});

export default SearchScreenApi;
