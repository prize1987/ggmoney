import React from 'react';
import {View, StyleSheet, Text, AsyncStorage, Alert} from 'react-native';
import {Card, CardItem, Switch, Picker} from 'native-base';

import ChoiceScreen from './ChoiceScreen';
import GGDB from './Database';

class OptionScreen extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isDownload: false,
      isSave: false,
      mapSearchLimit: '100',
      db: new GGDB(),
    };

    this.initStatus();
  }

  initStatus = async () => {
    let mapSearchLimit = await AsyncStorage.getItem('mapSearchLimit');
    let isDownload = await AsyncStorage.getItem('isDownload');
    let isSave = await AsyncStorage.getItem('isSave');

    this.setState({
      isDownload: isDownload === 'true',
      isSave: isSave === 'true',
      mapSearchLimit: mapSearchLimit,
    });
  };

  downloadToggle = async () => {
    const {db, isDownload} = this.state;
    if (isDownload) {
      Alert.alert(
        '다운로드 항목 제거 확인',
        '다운로드받은 데이터도 제거하시겠습니까?',
        [
          {
            text: '예',
            onPress: async () => {
              await db.deleteGgmoneyAll();
              await db.initMstSigun();
              await AsyncStorage.removeItem('isDownload');
              await AsyncStorage.removeItem('isSave');
              this.setState({isDownload: false, isSave: false});
            },
          },
          {
            text: '아니오',
            onPress: async () => {
              await AsyncStorage.removeItem('isDownload');
              await AsyncStorage.removeItem('isSave');
              this.setState({isDownload: false, isSave: false});
            },
          },
          {
            text: '취소',
            // onPress: () => {
            //   console.log('Cancel Pressed');
            // },
            style: 'cancel',
          },
        ],
        {cancelable: false},
      );
    } else {
      Alert.alert(
        '데이터 다운로드',
        '표시되는 리스트에서 시군을 선택해주세요.',
        [
          {
            text: '확인',
            style: 'default',
          },
        ],
        {cancelable: false},
      );

      AsyncStorage.setItem('isDownload', 'true');
      AsyncStorage.setItem('isSave', 'true');
      this.setState({isDownload: true, isSave: true});
    }
  };

  saveToggle = async () => {
    const {isSave} = this.state;

    if (isSave) {
      await AsyncStorage.removeItem('isSave');
    } else {
      AsyncStorage.setItem('isSave', 'true');
    }
    this.setState({isSave: !isSave});
  };

  onMapSearchLimitChange = value => {
    AsyncStorage.setItem('mapSearchLimit', value);
    this.setState({mapSearchLimit: value});
  };

  render() {
    const {isDownload, mapSearchLimit, isSave} = this.state;
    return (
      <View style={styles.container}>
        <View style={styles.topContainer}>
          <Card>
            <CardItem>
              <View>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
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
                <View>
                  <Text style={styles.cardItemSubText}>
                    지도에 너무 많은 마커가 표시되지 않도록 제한하는 기능입니다.
                  </Text>
                  <Text style={styles.cardItemSubText}>
                    기기의 성능을 고려하여 적절한 수로 설정해주세요.
                  </Text>
                  <Text style={styles.cardItemSubText}>(Default : 100개)</Text>
                </View>
              </View>
            </CardItem>
          </Card>
          <Card>
            <CardItem>
              <View>
                <View style={{flexDirection: 'row', alignContent: 'center'}}>
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
            <CardItem>
              <View>
                <View style={{flexDirection: 'row', alignContent: 'center'}}>
                  <Text style={styles.cardItemText}>마지막 검색어 저장</Text>
                  <Switch
                    onValueChange={this.saveToggle}
                    value={isSave}
                    disabled={!isDownload}
                  />
                </View>
                <View>
                  <Text style={styles.cardItemSubText}>
                    마지막으로 검색한 검색어를 저장합니다.
                  </Text>
                  <Text style={styles.cardItemSubText}>
                    다운로드 방식 사용시 활성화됩니다.
                  </Text>
                </View>
              </View>
            </CardItem>
          </Card>
        </View>
        <View style={styles.bottomContainer}>
          {isDownload ? <ChoiceScreen /> : <></>}
        </View>
        <View>
          <Text style={styles.sourceDisplayText}>
            - 데이터 출처 : 경기데이터드림(data.gg.go.kr) -
          </Text>
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
    fontSize: 19,
    paddingBottom: 10,
    paddingRight: 20,
  },
  mapLimitPicker: {
    width: 160,
    paddingBottom: 10,
    paddingRight: 20,
  },
  cardItemSubText: {
    fontSize: 12,
    paddingLeft: 10,
    // paddingTop: 10,
    color: 'gray',
  },
  sourceDisplayText: {
    fontSize: 13,
    paddingRight: 20,
    textAlign: 'right',
    color: 'gray',
  },
});

export default OptionScreen;
