import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  AsyncStorage,
} from 'react-native';
import {Item, Label, Input, Icon} from 'native-base';
import ApiMain from './ApiMain';
import Toast from 'react-native-root-toast';

import Geolocation from '@react-native-community/geolocation';
import MapView, {PROVIDER_GOOGLE, Marker, Callout} from 'react-native-maps';

class SearchScreenApi extends React.Component {
  state = {
    searchConName: '',
    searchConAddr: '',
    addrType: '',
    api: null,
    data: [],
    fetchCnt: 0,
    nextIndex: 1,
    mode: 'start',
    region: {
      latitude: 37.275077,
      longitude: 127.009477,
      latitudeDelta: 0.02,
      longitudeDelta: 0.01,
    },
  };

  numToRender = 100;

  constructor(props) {
    super(props);

    this.state.api = new ApiMain();

    AsyncStorage.getItem('mapSearchLimit').then(res => {
      console.log(res);
      this.numToRender = res ? res : 100;
      console.log(this.numToRender);
    });
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
      this.numToRender,
      searchConName,
      searchConAddr,
      addrType,
    );

    this.showToast(
      totalCnt >= this.numToRender
        ? this.numToRender + '건 이상'
        : totalCnt + '건 조회',
      Toast.durations.SHORT,
      Toast.positions.BOTTOM,
    );

    let {region} = this.state;

    if (recvData.length > 0) {
      let minlat = 9999;
      let maxlat = -9999;
      let minlon = 9999;
      let maxlon = -9999;

      recvData.map(item => {
        if (
          item.REFINE_WGS84_LAT !== null &&
          item.REFINE_WGS84_LOGT !== null &&
          item.REFINE_WGS84_LAT > 35 &&
          item.REFINE_WGS84_LAT < 40 &&
          item.REFINE_WGS84_LOGT > 125 &&
          item.REFINE_WGS84_LOGT < 130
        ) {
          minlat = Math.min(minlat, item.REFINE_WGS84_LAT);
          maxlat = Math.max(maxlat, item.REFINE_WGS84_LAT);
          minlon = Math.min(minlon, item.REFINE_WGS84_LOGT);
          maxlon = Math.max(maxlon, item.REFINE_WGS84_LOGT);
        }
      });

      if (minlat !== 9999 && minlon !== 9999) {
        region = {
          latitude: (minlat + maxlat) / 2,
          longitude: (minlon + maxlon) / 2,
          latitudeDelta: maxlat - minlat,
          longitudeDelta: maxlon - minlon,
        };
      }
    }

    this.setState({
      data: recvData,
      fetchCnt: recvData ? recvData.length : 0,
      addrType: addrType,
      nextIndex: 2,
      mode: 'loaded',
      region: region,
    });
  }

  onRegionChange = reg => {
    const {region} = this.state;
    // console.log(reg);
    if (
      region.latitude.toFixed(6) !== reg.latitude.toFixed(6) ||
      region.longitude.toFixed(6) !== reg.longitude.toFixed(6)
    ) {
      this.setState({region: reg});
    }
    // this.setState({region: region});
  };

  getCurrentPosition = () => {
    Geolocation.getCurrentPosition(
      position => {
        console.log(position);
        let curRegion = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.01,
        };
        this.setState({region: curRegion});
      },
      error => {
        console.log(error);
      },
    );
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
              placeholder="주소(지번 or 도로명)"
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
                // initialRegion={region}
                region={region}
                clusteringEnabled={false}
                spiralEnabled={true}
                onRegionChangeComplete={this.onRegionChange}
                showsUserLocation={true}>
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
              <TouchableOpacity
                style={styles.myOverlayContainer}
                onPress={this.getCurrentPosition}>
                <Icon name="md-locate" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.curOverlayContainer}
                onPress={() => {
                  alert('옵션-다운로드 방식 사용 기능을 켜주세요');
                }}>
                <Icon style={styles.curOverlayIcon} name="md-refresh" />
                <Text style={styles.curOverlayText}>현 지도에서 검색</Text>
              </TouchableOpacity>
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
  curOverlayContainer: {
    position: 'absolute',
    alignSelf: 'center',
    top: 10,
    backgroundColor: 'rgba(240,240,240,100)',
    width: 150,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    borderRadius: 10,
    shadowColor: 'rgb(50, 50, 50)',
    shadowOpacity: 0.5,
    shadowRadius: 5,
    shadowOffset: {
      height: -1,
      width: 0,
    },
    elevation: 5,
  },
  curOverlayIcon: {
    color: 'rgba(50,50,200,100)',
    fontSize: 20,
    marginRight: 9,
  },
  curOverlayText: {
    color: 'rgba(50,50,200,100)',
    fontSize: 16,
  },
  myOverlayContainer: {
    position: 'absolute',
    left: 20,
    bottom: 30,
    backgroundColor: 'rgba(240,240,240,100)',
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    shadowColor: 'rgb(50, 50, 50)',
    shadowOpacity: 0.5,
    shadowRadius: 5,
    shadowOffset: {
      height: -1,
      width: 0,
    },
    elevation: 5,
  },
  myOverlayText: {
    color: 'white',
    fontSize: 18,
  },
});

export default SearchScreenApi;
