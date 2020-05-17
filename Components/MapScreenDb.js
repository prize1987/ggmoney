import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  AsyncStorage,
  FlatList,
  Keyboard,
} from 'react-native';
import {Item, Label, Input, Icon, ListItem} from 'native-base';
import CustomButton from './CustomButton';
import GGDB from './Database';
import Toast from 'react-native-root-toast';
import Geolocation from '@react-native-community/geolocation';
import MapView, {PROVIDER_GOOGLE, Marker, Callout} from 'react-native-maps';

class MapScreenDb extends React.Component {
  state = {
    searchCon: '',
    db: null,
    data: [],
    fetchCnt: 0,
    isLoaded: true,
    region: {
      latitude: 37.275077,
      longitude: 127.009477,
      latitudeDelta: 0.02,
      longitudeDelta: 0.01,
    },
    showList: false,
  };

  numToRender = 100;

  constructor(props) {
    super(props);

    this.state.db = new GGDB();

    AsyncStorage.getItem('mapSearchLimit').then(res => {
      this.numToRender = res ? res : 100;
    });

    this.loadLastRegion();
  }

  loadLastRegion = async () => {
    AsyncStorage.getItem('lastLatitude').then(latitude => {
      AsyncStorage.getItem('lastLongitude').then(longitude => {
        AsyncStorage.getItem('lastLatitudeDelta').then(latitudeDelta => {
          AsyncStorage.getItem('lastLongitudeDelta').then(longitudeDelta => {
            if (latitude && longitude && latitudeDelta && longitudeDelta) {
              let lastRegion = {
                latitude: parseFloat(latitude),
                longitude: parseFloat(longitude),
                latitudeDelta: parseFloat(latitudeDelta),
                longitudeDelta: parseFloat(longitudeDelta),
              };
              console.log(lastRegion);

              this.setState({region: lastRegion});
            }
          });
        });
      });
    });
  };

  componentDidMount() {
    // this.searchData();
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

  async searchData(area) {
    const {searchCon, db} = this.state;
    // console.log(searchCon);

    this.setState({isLoaded: false});

    let recvData;

    if (area === undefined) {
      recvData = await db.selectGgmoney(searchCon, 0, this.numToRender);
    } else {
      let lat_lcl = area.latitude - area.latitudeDelta / 2;
      let lat_ucl = area.latitude + area.latitudeDelta / 2;
      let lon_lcl = area.longitude - area.longitudeDelta / 2;
      let lon_ucl = area.longitude + area.longitudeDelta / 2;

      recvData = await db.selectGgmoneyByArea(
        searchCon,
        lat_lcl,
        lat_ucl,
        lon_lcl,
        lon_ucl,
        this.numToRender,
      );
    }

    this.showToast(
      recvData.length >= this.numToRender
        ? this.numToRender + '건 이상'
        : recvData.length + '건 조회',
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
          latitude: area ? area.latitude : (minlat + maxlat) / 2,
          longitude: area ? area.longitude : (minlon + maxlon) / 2,
          latitudeDelta: area ? area.latitudeDelta : maxlat - minlat,
          longitudeDelta: area ? area.longitudeDelta : maxlon - minlon,
        };
      }
    }

    this.setState({
      data: recvData,
      fetchCnt: recvData.length,
      isLoaded: true,
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
      AsyncStorage.setItem('lastLatitude', reg.latitude.toString());
      AsyncStorage.setItem('lastLongitude', reg.longitude.toString());
      AsyncStorage.setItem('lastLatitudeDelta', reg.latitudeDelta.toString());
      AsyncStorage.setItem('lastLongitudeDelta', reg.longitudeDelta.toString());
      this.setState({region: reg});
    }
  };

  getCurrentPosition = () => {
    Geolocation.getCurrentPosition(
      position => {
        // console.log(position);
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
    const {data, isLoaded, region, showList} = this.state;
    this.markers = {};

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
              onSubmitEditing={() => this.searchData()}
              returnKeyType="search"
            />
          </Item>
          <CustomButton
            title="검색"
            titleColor="white"
            buttonColor="#2788e5"
            onPress={() => this.searchData()}
          />
        </View>
        <View style={styles.container}>
          {isLoaded ? (
            <View style={styles.container}>
              <View style={styles.container}>
                <MapView
                  style={styles.container}
                  provider={PROVIDER_GOOGLE}
                  initialRegion={region}
                  region={region}
                  onRegionChangeComplete={this.onRegionChange}
                  onPress={e => {
                    Keyboard.dismiss();
                    //   console.log(e.nativeEvent.action);
                    //   console.log(e._targetInst.return);
                    //   this.markers[e._targetInst.return.key].showCallout();
                  }}
                  showsUserLocation={true}>
                  {data ? (
                    data.map((item, index) => {
                      if (
                        item.REFINE_WGS84_LAT !== null &&
                        item.REFINE_WGS84_LOGT !== null
                      ) {
                        return (
                          <Marker
                            key={index}
                            coordinate={{
                              latitude: parseFloat(item.REFINE_WGS84_LAT),
                              longitude: parseFloat(item.REFINE_WGS84_LOGT),
                            }}
                            ref={ref => {
                              this.markers[index] = ref;
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
                              <Text style={styles.mapInfoSub}>
                                {item.TELNO}
                              </Text>
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
                {!showList ? (
                  <TouchableOpacity
                    style={styles.curOverlayContainer}
                    onPress={() => {
                      this.searchData(this.state.region);
                    }}>
                    <Icon style={styles.curOverlayIcon} name="md-refresh" />
                    <Text style={styles.curOverlayText}>현 지도에서 검색</Text>
                  </TouchableOpacity>
                ) : (
                  <></>
                )}
                <TouchableOpacity
                  style={styles.listOverlayContainer}
                  onPress={() => {
                    this.setState({showList: !showList});
                  }}>
                  <Icon style={styles.curOverlayIcon} name="md-list" />
                  <Text style={styles.curOverlayText}>
                    {showList ? '목록 숨기기' : '목록 표시'}
                  </Text>
                </TouchableOpacity>
              </View>
              {showList ? (
                <View style={styles.listContainer}>
                  <Text>{data.length}건</Text>
                  <FlatList
                    style={styles.container}
                    data={data}
                    // initialNumToRender={numToRender}
                    // onEndReachedThreshold={1}
                    // onEndReached={this.onEndReached}
                    renderItem={({item, index}) => {
                      return (
                        <ListItem style={{flex: 1}}>
                          <TouchableOpacity
                            style={styles.listItemContainer}
                            onPress={() => {
                              let curRegion = {
                                latitude: parseFloat(item.REFINE_WGS84_LAT),
                                longitude: parseFloat(item.REFINE_WGS84_LOGT),
                                latitudeDelta: region.latitudeDelta,
                                longitudeDelta: region.longitudeDelta,
                              };
                              this.setState({
                                region: curRegion,
                              });
                              this.markers[index].showCallout();
                            }}>
                            <Text style={styles.itemTitle}>
                              {item.CMPNM_NM}
                            </Text>
                            <Text style={styles.itemSub}>
                              {item.INDUTYPE_NM}
                            </Text>
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
                </View>
              ) : (
                <></>
              )}
            </View>
          ) : (
            <ActivityIndicator size={50} style={{marginTop: 50}} />
          )}
        </View>
      </>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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
  listItemContainer: {
    borderWidth: 1,
    flex: 1,
    padding: 10,
    borderRadius: 10,
  },
  itemTitle: {
    fontSize: 16,
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
    flex: 0.6,
    padding: 10,
    borderWidth: 1,
    // backgroundColor: '#2fd6c2',
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
  listOverlayContainer: {
    position: 'absolute',
    alignSelf: 'center',
    bottom: 10,
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
});

export default MapScreenDb;
