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
import MapView, {PROVIDER_GOOGLE, Marker, Callout} from 'react-native-maps';

class SearchScreenApi extends React.Component {
  static defaultProps = {numToRender: 1000};
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
    region: {
      latitude: 37.275077,
      longitude: 127.009477,
      latitudeDelta: 0.02,
      longitudeDelta: 0.01,
    },
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

    let {region} = this.state;

    if (recvData.length > 0) {
      let minlat = recvData[0].REFINE_WGS84_LAT;
      let maxlat = recvData[0].REFINE_WGS84_LAT;
      let minlon = recvData[0].REFINE_WGS84_LOGT;
      let maxlon = recvData[0].REFINE_WGS84_LOGT;

      recvData.map(item => {
        if (item.REFINE_WGS84_LAT !== null && item.REFINE_WGS84_LOGT !== null) {
          minlat = Math.min(minlat, item.REFINE_WGS84_LAT);
          maxlat = Math.max(maxlat, item.REFINE_WGS84_LAT);
          minlon = Math.min(minlon, item.REFINE_WGS84_LOGT);
          maxlon = Math.max(maxlon, item.REFINE_WGS84_LOGT);
        }
      });

      region = {
        latitude: (minlat + maxlat) / 2,
        longitude: (minlon + maxlon) / 2,
        latitudeDelta: maxlat - minlat + 0.01,
        longitudeDelta: maxlon - minlon + 0.01,
      };
    }

    this.setState({
      data: recvData,
      fetchCnt: recvData ? recvData.length : 0,
      totalCnt: totalCnt,
      addrType: addrType,
      nextIndex: 2,
      mode: 'loaded',
      region: region,
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

  onRegionChange = region => {
    // console.log(region);
    this.setState({region: region});
  };

  render() {
    const {data, mode, region} = this.state;

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
            <View style={styles.container}>
              <MapView
                style={styles.container}
                provider={PROVIDER_GOOGLE}
                initialRegion={region}
                onRegionChangeComplete={this.onRegionChange}>
                {data ? (
                  data.map((item, index) => {
                    if (
                      item.REFINE_WGS84_LAT !== null &&
                      item.REFINE_WGS84_LOGT !== null
                    ) {
                      return (
                        <Marker
                          coordinate={{
                            latitude: parseFloat(item.REFINE_WGS84_LAT),
                            longitude: parseFloat(item.REFINE_WGS84_LOGT),
                          }}>
                          <Callout>
                            <Text style={styles.mapInfoText}>
                              {item.CMPNM_NM}
                            </Text>
                            <Text style={styles.mapInfoSub}>
                              {item.INDUTYPE_NM}
                            </Text>
                            <Text style={styles.mapInfoSub}>
                              {item.REFINE_LOTNO_ADDR}
                            </Text>
                            <Text style={styles.mapInfoSub}>
                              {item.REFINE_ROADNM_ADDR}
                            </Text>
                            <Text style={styles.mapInfoSub}>{item.TELNO}</Text>
                          </Callout>
                        </Marker>
                      );
                    }
                  })
                ) : (
                  <></>
                )}
              </MapView>
              {/* <TouchableOpacity style={styles.overlay}>
                <Text
                  style={{
                    position: 'absolute',
                    bottom: 50,
                  }}>
                  Touchable Opacity
                </Text>
                <ActivityIndicator
                  style={{
                    position: 'absolute',
                    bottom: 50,
                  }}
                />
              </TouchableOpacity> */}
            </View>
          ) : mode === 'loading' ? (
            <ActivityIndicator size={50} style={{marginTop: 50}} />
          ) : (
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
          )}
        </View>
      </>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: 'red',
  },
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
  icon: {
    fontSize: 24,
    color: 'gray',
    // marginHorizontal:,
  },
  listContainer: {
    flex: 1,
    alignContent: 'stretch',
    // alignItems: 'center',
    justifyContent: 'center',
    // backgroundColor: '#2fd6c2',
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
  mapInfoText: {
    fontSize: 15,
    alignSelf: 'center',
  },
  mapInfoSub: {
    fontSize: 11,
    color: 'grey',
    // alignSelf: 'center',
  },
});

export default SearchScreenApi;
