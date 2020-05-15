import React from 'react';
import {View, StyleSheet, Text, AsyncStorage} from 'react-native';
import {Card, CardItem, Switch, Picker} from 'native-base';

import ChoiceScreen from './ChoiceScreen';
import GGDB from './Database';

class OptionScreen extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isDownload: false,
      mapSearchLimit: '100',
      db: new GGDB(),
    };

    this.initStatus();
  }

  initStatus = async () => {
    let isDownload = await AsyncStorage.getItem('isDownload');
    let mapSearchLimit = await AsyncStorage.getItem('mapSearchLimit');
    // console.log(isDownload);
    // console.log(isDownload === 'true');
    this.setState({
      isDownload: isDownload === 'true',
      mapSearchLimit: mapSearchLimit,
    });
  };

  downloadToggle = async () => {
    const {db, isDownload} = this.state;
    if (isDownload) {
      await AsyncStorage.removeItem('isDownload');
      await db.deleteGgmoneyAll();
      await db.initMstSigun();
    } else {
      AsyncStorage.setItem('isDownload', 'true');
    }
    this.setState({isDownload: !isDownload});
  };

  onMapSearchLimitChange = value => {
    AsyncStorage.setItem('mapSearchLimit', value);
    this.setState({mapSearchLimit: value});
  };

  render() {
    const {isDownload, mapSearchLimit} = this.state;
    return (
      <View style={styles.container}>
        <View style={styles.topContainer}>
          <Card>
            <CardItem>
              <View>
                <View style={{flexDirection: 'row'}}>
                  <Text style={styles.cardItemText}>지도 검색시 개수 제한</Text>

                  <Picker
                    mode="dropdown"
                    placeholder="조회개수 선택"
                    style={styles.mapLimitPicker}
                    selectedValue={mapSearchLimit}
                    onValueChange={this.onMapSearchLimitChange}>
                    <Picker.Item label="100 개" value="100" />
                    <Picker.Item label="300 개" value="300" />
                    <Picker.Item label="500 개" value="500" />
                    <Picker.Item label="1000 개" value="1000" />
                  </Picker>
                </View>
              </View>
            </CardItem>
          </Card>
          <Card>
            <CardItem>
              <View>
                <View style={{flexDirection: 'row'}}>
                  <Text style={styles.cardItemText}>다운로드 방식 사용</Text>
                  <Switch
                    onValueChange={this.downloadToggle}
                    value={isDownload}
                  />
                </View>

                <View>
                  <Text style={styles.cardItemSubText}>
                    시군별 데이터를 현재 기기에 직접 저장하는 방식입니다.
                  </Text>
                  <Text style={styles.cardItemSubText}>
                    오프라인 상태에서도 검색이 가능하며,
                  </Text>
                  <Text style={styles.cardItemSubText}>
                    키워드 검색으로 빠르고 편리한 검색이 가능합니다.
                  </Text>
                </View>
              </View>
            </CardItem>
          </Card>
        </View>
        <View style={styles.bottomContainer}>
          {isDownload ? <ChoiceScreen /> : <></>}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topContainer: {
    // flex: 1,
    // backgroundColor: 'yellow',
    // alignItems: 'center',
    alignContent: 'stretch',
    justifyContent: 'center',
  },
  bottomContainer: {
    flex: 1,
    // backgroundColor: 'skyblue',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardItemText: {
    fontSize: 24,
    paddingBottom: 10,
    paddingRight: 20,
  },
  mapLimitPicker: {
    width: 120,
    paddingBottom: 10,
    paddingRight: 20,
  },
  cardItemSubText: {
    fontSize: 12,
    paddingLeft: 10,
    // paddingTop: 10,
    color: 'gray',
  },
});

export default OptionScreen;
