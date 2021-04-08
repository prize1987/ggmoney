import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  AsyncStorage,
  FlatList,
  Modal,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import {Item, Label, Input, Icon, ListItem} from 'native-base';
import ApiMain from '../ApiMain';
import Toast from 'react-native-root-toast';

import Geolocation from '@react-native-community/geolocation';
import MapView, {PROVIDER_GOOGLE, Marker, Callout} from 'react-native-maps';

import StoreInfoModal from '../StoreInfoModal';

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
    showList: false,
    modalOpen: false,
    selectedItem: {},
  };

  numToRender = 100;

  constructor(props) {
    super(props);

    this.state.api = new ApiMain();

    AsyncStorage.getItem('mapSearchLimit').then(res => {
      this.numToRender = res ? res : 100;
    });
  }

  loadAddrRequest = async () => {
    AsyncStorage.getItem('addrRequest').then(addr => {
      if (addr) {
        this.setState({searchConAddr: addr}, () => {
          this.getInitData();
          AsyncStorage.removeItem('addrRequest');
        });
      }
    });
  };

  componentDidMount() {
    // this.getInitData();
    // console.log(this.props.numToRender);

    this.loadAddrRequest();
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
      Toast.positions.BOTTOM - 160,
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
          latitudeDelta: Math.max(maxlat - minlat, 0.002),
          longitudeDelta: Math.max(maxlon - minlon, 0.002),
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
    const {data, mode, region, showList, modalOpen} = this.state;
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
          <Item style={styles.textInput} inlineLabel>
            <Label>
              <Icon style={styles.icon} name="search" type="MaterialIcons" />
            </Label>
            <Input
              placeholder="이름으로 검색"
              onChangeText={text => {
                this.setState({searchConName: text});
              }}
              onSubmitEditing={() => this.getInitData()}
              returnKeyType="search"
              value={this.state.searchConName}
              clearButtonMode={true}
            />
            {this.state.searchConName.length > 0 ? (
              <TouchableWithoutFeedback
                onPress={() => {
                  this.setState({searchConName: ''});
                }}>
                <Icon
                  name="cancel"
                  style={styles.clearTextButton}
                  type="MaterialIcons"
                />
              </TouchableWithoutFeedback>
            ) : (
              <></>
            )}
          </Item>
          <Item style={styles.textInput} inlineLabel>
            <Label>
              <Icon style={styles.icon} name="search" type="MaterialIcons" />
            </Label>
            <Input
              placeholder="주소로 검색"
              onChangeText={text => {
                this.setState({searchConAddr: text});
              }}
              onSubmitEditing={() => this.getInitData()}
              returnKeyType="search"
              value={this.state.searchConAddr}
              clearButtonMode={true}
            />
            {this.state.searchConAddr.length > 0 ? (
              <TouchableWithoutFeedback
                onPress={() => {
                  this.setState({searchConAddr: ''});
                }}>
                <Icon
                  name="cancel"
                  style={styles.clearTextButton}
                  type="MaterialIcons"
                />
              </TouchableWithoutFeedback>
            ) : (
              <></>
            )}
          </Item>
        </View>
        <View style={styles.container}>
          {mode === 'loaded' ? (
            <View style={styles.container}>
              <View style={styles.container}>
                <MapView
                  style={styles.container}
                  provider={PROVIDER_GOOGLE}
                  // initialRegion={region}
                  region={region}
                  clusteringEnabled={false}
                  spiralEnabled={true}
                  onRegionChangeComplete={this.onRegionChange}
                  showsUserLocation={true}
                  onPress={() => {
                    Keyboard.dismiss();
                  }}>
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
                    })
                  ) : (
                    <></>
                  )}
                </MapView>
                <TouchableOpacity
                  style={styles.myOverlayContainer}
                  onPress={this.getCurrentPosition}>
                  <Icon name="gps-fixed" type="MaterialIcons" />
                </TouchableOpacity>
                {!showList ? (
                  <TouchableOpacity
                    style={styles.curOverlayContainer}
                    onPress={() => {
                      alert('옵션-다운로드 방식 사용 기능을 켜주세요');
                    }}>
                    <Icon
                      style={styles.curOverlayIcon}
                      name="refresh"
                      type="MaterialIcons"
                    />
                    <Text style={styles.curOverlayText}>현 지도에서 검색</Text>
                  </TouchableOpacity>
                ) : (
                  <></>
                )}
                {data.length > 0 ? (
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
                ) : (
                  <></>
                )}
              </View>
              {showList ? (
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
              ) : (
                <></>
              )}
            </View>
          ) : mode === 'loading' ? (
            <ActivityIndicator size={50} style={{marginTop: 50}} />
          ) : (
            <TouchableWithoutFeedback
              onPress={() => {
                Keyboard.dismiss();
              }}>
              <View style={styles.infoContainer}>
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
    fontSize: 18,
    color: 'gray',
    // marginHorizontal:,
  },
  infoContainer: {
    flex: 1,
    alignContent: 'stretch',
    // alignItems: 'center',
    justifyContent: 'center',
    // backgroundColor: '#2fd6c2',
  },
  listContainer: {
    flex: 1,
    alignContent: 'stretch',
    // backgroundColor: '#2fd6c2',
  },
  infoText: {
    fontSize: 18,
    alignSelf: 'center',
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

export default SearchScreenApi;
