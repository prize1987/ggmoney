import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import {Item, Label, Input, Icon, ListItem, CheckBox} from 'native-base';
import ApiMain from './ApiMain';
import Toast from 'react-native-root-toast';

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
    const {data, mode} = this.state;

    return (
      <>
        <View style={styles.searchContainer}>
          <Item style={styles.textInput} inlineLabel>
            <Label>
              <Icon style={styles.icon} name="search" />
            </Label>
            <Input
              placeholder="상호명"
              onChangeText={text => {
                this.setState({searchConName: text});
              }}
              onSubmitEditing={() => this.getInitData()}
              returnKeyType="search"
            />
          </Item>
          <Item style={styles.textInput} inlineLabel>
            <Label>
              <Icon style={styles.icon} name="search" />
            </Label>
            <Input
              placeholder="주소"
              onChangeText={text => {
                this.setState({searchConAddr: text});
              }}
              onSubmitEditing={() => this.getInitData()}
              returnKeyType="search"
            />
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
                    <TouchableOpacity style={styles.itemArea}>
                      <Text style={styles.itemTitle}>{item.CMPNM_NM}</Text>
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
            <Text>검색어를 입력해주세요.</Text>
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
    fontSize: 24,
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
});

export default SearchScreenApi;
