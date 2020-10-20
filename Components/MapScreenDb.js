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
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import {Item, Label, Input, Icon, ListItem, Picker} from 'native-base';
import CustomButton from './CustomButton';
import GGDB from './Database';
import Toast from 'react-native-root-toast';
import Geolocation from '@react-native-community/geolocation';
import MapView, {PROVIDER_GOOGLE, Marker, Callout} from 'react-native-maps';

import StoreInfoModal from './StoreInfoModal';

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

class MapScreenDb extends React.Component {
  isFirstRegionChange = true;

  state = {
    indutypeCon: '',
    searchCon: '',
    db: null,
    data: [],
    fetchCnt: 0,
    isLoaded: false,
    region: {
      latitude: 37.275077,
      longitude: 127.009477,
      latitudeDelta: 0.02,
      longitudeDelta: 0.01,
    },
    showList: false,
    modalOpen: false,
    selectedItem: {},
  };

  numToRender = 100;

  constructor(props) {
    super(props);

    this.state.db = new GGDB();
  }

  componentDidMount() {
    // this.searchData();
    // console.log(this.props.numToRender);
    AsyncStorage.getItem('mapSearchLimit').then(res => {
      this.numToRender = res ? res : 100;
    });

    this.loadAddrRequest();
  }

  loadLastStatus = async () => {
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

              this.setState({region: lastRegion});
            }
          });
        });
      });
    });

    AsyncStorage.getItem('isSave').then(isSave => {
      if (isSave === 'true') {
        AsyncStorage.getItem('lastSearchCon').then(searchCon => {
          if (searchCon === null) {
            searchCon = '';
          }

          this.setState({searchCon: searchCon});
        });
      }
    });

    // AsyncStorage.getItem('lastIndutypeCon').then(induTypeCon => {
    //   if (induTypeCon === null) {
    //     induTypeCon = '';
    //   }

    //   this.setState({indutypeCon: induTypeCon});
    // });
  };

  loadAddrRequest = async () => {
    AsyncStorage.getItem('addrRequest').then(addr => {
      if (addr) {
        this.setState({searchCon: addr}, () => {
          // this.isFirstRegionChange = false;
          this.searchData(undefined, false);
          AsyncStorage.removeItem('addrRequest');
        });

        // 검색어 조정 (주소 -> 검색키워드)
        AsyncStorage.getItem('lastSearchCon').then(searchCon => {
          if (searchCon === null) {
            searchCon = '';
          }

          this.setState({searchCon: searchCon});
        });
      } else {
        this.loadLastStatus();
        this.setState({isLoaded: true});
      }
    });
  };

  showToast(msg, dur = Toast.durations.LONG, pos = Toast.positions.BOTTOM) {
    Toast.show(msg, {
      duration: dur,
      position: pos,
      shadow: true,
      animation: true,
      hideOnPress: true,
    });
  }

  async searchData(area, searchConSave = true) {
    const {indutypeCon, searchCon, db} = this.state;
    // console.log(searchCon);

    if (searchConSave) {
      AsyncStorage.setItem('lastSearchCon', searchCon);
    }

    this.setState({isLoaded: false});

    let recvData;

    if (area === undefined) {
      recvData = await db.selectGgmoney(
        indutypeCon,
        searchCon,
        0,
        this.numToRender,
      );
    } else {
      let lat_lcl = area.latitude - area.latitudeDelta / 2;
      let lat_ucl = area.latitude + area.latitudeDelta / 2;
      let lon_lcl = area.longitude - area.longitudeDelta / 2;
      let lon_ucl = area.longitude + area.longitudeDelta / 2;

      recvData = await db.selectGgmoneyByArea(
        indutypeCon,
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
      Toast.positions.BOTTOM - 160,
    );

    let {region} = this.state;

    if (recvData.length > 0) {
      let minlat = 9999;
      let maxlat = -9999;
      let minlon = 9999;
      let maxlon = -9999;

      await recvData.map(item => {
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
          latitudeDelta: area
            ? area.latitudeDelta
            : Math.max(maxlat - minlat, 0.002),
          longitudeDelta: area
            ? area.longitudeDelta
            : Math.max(maxlon - minlon, 0.002),
        };
      }
    }

    this.setState({
      data: recvData,
      fetchCnt: recvData.length,
      region: region,
      isLoaded: true,
      showList: true,
    });
  }

  onRegionChange = reg => {
    if (this.isFirstRegionChange) {
      this.isFirstRegionChange = false;
    } else {
      const {region} = this.state;
      // console.log('prev : ' + region.latitude);
      // console.log('curr : ' + reg.latitude);
      // console.log(reg);
      if (
        region.latitude.toFixed(6) !== reg.latitude.toFixed(6) ||
        region.longitude.toFixed(6) !== reg.longitude.toFixed(6)
      ) {
        AsyncStorage.setItem('lastLatitude', reg.latitude.toString());
        AsyncStorage.setItem('lastLongitude', reg.longitude.toString());
        AsyncStorage.setItem('lastLatitudeDelta', reg.latitudeDelta.toString());
        AsyncStorage.setItem(
          'lastLongitudeDelta',
          reg.longitudeDelta.toString(),
        );

        this.setState({region: reg});
      }
    }
  };

  onIndutypeChange = value => {
    this.setState({indutypeCon: value}, this.searchData);
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
    const {data, isLoaded, region, showList, modalOpen} = this.state;
    this.markers = {};

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
          />
        </Modal>

        <View style={styles.searchContainer}>
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
              onSubmitEditing={() => this.searchData()}
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
              this.searchData();
            }}
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
                  {data &&
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
                            }}
                            ref={ref => {
                              this.markers[index] = ref;
                            }}>
                            <Callout
                              onPress={() => {
                                this.setState({
                                  modalOpen: true,
                                  selectedItem: item,
                                });
                              }}>
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
                    })}
                </MapView>
                <TouchableOpacity
                  style={styles.myOverlayContainer}
                  onPress={this.getCurrentPosition}>
                  <Icon name="gps-fixed" type="MaterialIcons" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.curOverlayContainer}
                  onPress={() => {
                    this.searchData(this.state.region);
                  }}>
                  <Icon
                    style={styles.curOverlayIcon}
                    name="refresh"
                    type="MaterialIcons"
                  />
                  <Text style={styles.curOverlayText}>현 지도에서 검색</Text>
                </TouchableOpacity>
                {data.length > 0 && (
                  <TouchableOpacity
                    style={styles.listOverlayContainer}
                    onPress={() => {
                      this.setState({showList: !showList});
                    }}>
                    <Icon
                      style={styles.curOverlayIcon}
                      name="list"
                      type="MaterialIcons"
                    />
                    <Text style={styles.curOverlayText}>
                      {showList ? '목록 숨기기' : '목록 표시'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
              {showList && (
                <View style={styles.listContainer}>
                  <Text>{data.length}건 조회됨</Text>
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
                              if (
                                item.REFINE_WGS84_LAT &&
                                item.REFINE_WGS84_LOGT
                              ) {
                                let curRegion = {
                                  latitude:
                                    parseFloat(item.REFINE_WGS84_LAT) +
                                    region.latitudeDelta / 3,
                                  longitude: parseFloat(item.REFINE_WGS84_LOGT),
                                  latitudeDelta: region.latitudeDelta,
                                  longitudeDelta: region.longitudeDelta,
                                };
                                this.setState({
                                  region: curRegion,
                                });
                                this.markers[index].showCallout();
                              } else {
                                this.showToast('좌표 정보가 없습니다.');
                              }
                            }}
                            onLongPress={() => {
                              this.setState({
                                modalOpen: true,
                                selectedItem: item,
                              });
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
  clearTextButton: {
    fontSize: 20,
    color: 'gray',
  },
});

export default MapScreenDb;
