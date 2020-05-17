import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import {Item, Label, Input, Icon, ListItem} from 'native-base';
import CustomButton from './CustomButton';
import GGDB from './Database';
import Toast from 'react-native-root-toast';

class SearchScreenDb extends React.Component {
  static defaultProps = {numToRender: 20};
  state = {
    searchCon: '',
    db: null,
    data: [],
    fetchCnt: 0,
    totalCnt: 0,
    isLoaded: false,
  };

  constructor(props) {
    super(props);

    this.state.db = new GGDB();
  }

  componentDidMount() {
    this.getInitData();
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
    const {searchCon, db} = this.state;
    console.log(searchCon);

    this.setState({isLoaded: false});

    let totalCnt = await db.selectGgmoneyCnt(searchCon);
    let recvData = await db.selectGgmoney(searchCon, 0, numToRender);

    this.showToast(
      totalCnt + '건 조회',
      Toast.durations.SHORT,
      Toast.positions.BOTTOM,
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
    const {searchCon, data, fetchCnt, db} = this.state;

    let recvData = await db.selectGgmoney(searchCon, fetchCnt, numToRender);

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
  render() {
    const {numToRender} = this.props;
    const {data, isLoaded, fetchCnt, totalCnt} = this.state;

    return (
      <>
        <View style={styles.searchContainer}>
          <Item style={styles.textInput} inlineLabel>
            <Label>
              <Icon style={styles.icon} name="search" />
            </Label>
            <Input
              placeholder="키워드 검색 (띄어쓰기로 구분)"
              onChangeText={text => {
                this.setState({searchCon: text});
              }}
              onSubmitEditing={() => this.getInitData()}
              returnKeyType="search"
            />
          </Item>
          <CustomButton
            title="검색"
            titleColor="white"
            buttonColor="#2788e5"
            onPress={() => this.getInitData()}
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
                    <TouchableOpacity style={styles.itemArea}>
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
});

export default SearchScreenDb;
