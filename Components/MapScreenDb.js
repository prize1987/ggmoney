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

class MapScreenDb extends React.Component {
  static defaultProps = {numToRender: 100};
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

  render() {
    const {data, isLoaded} = this.state;

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
            <Text>지도 표시될 곳</Text>
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
    fontSize: 24,
    fontWeight: 'bold',
  },
  itemSub: {
    fontSize: 13,
    color: '#595959',
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
});

export default MapScreenDb;
