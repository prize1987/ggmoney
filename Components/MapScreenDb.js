import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import {Item, Label, Input, Icon} from 'native-base';
import CustomButton from './CustomButton';
import GGDB from './Database';
import Toast from 'react-native-root-toast';
import MapView, {PROVIDER_GOOGLE, Marker, Callout} from 'react-native-maps';

class MapScreenDb extends React.Component {
  static defaultProps = {numToRender: 100};
  state = {
    searchCon: '',
    db: null,
    data: [],
    fetchCnt: 0,
    totalCnt: 0,
    isLoaded: true,
    region: {
      latitude: 37.275077,
      longitude: 127.009477,
      latitudeDelta: 0.02,
      longitudeDelta: 0.01,
    },
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
      fetchCnt: recvData.length,
      totalCnt: totalCnt,
      isLoaded: true,
      region: region,
    });
  }

  onRegionChange = region => {
    // console.log(region);
    this.setState({region: region});
  };

  render() {
    const {data, isLoaded, region} = this.state;

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

export default MapScreenDb;
