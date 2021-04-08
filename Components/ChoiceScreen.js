import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  Switch,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  AsyncStorage,
} from 'react-native';
import {Button} from 'native-base';
import Toast from 'react-native-root-toast';

import GGDB from './Database';
import ApiMain from './ApiMain';
import CustomButton from './CustomButton';

const siguns = [
  ['가평군', '고양시', '과천시'],
  ['광명시', '광주시', '구리시'],
  ['군포시', '김포시', '남양주시'],
  ['동두천시', '부천시', '성남시'],
  ['수원시', '시흥시', '안산시'],
  ['안성시', '안양시', '양주시'],
  ['양평군', '여주시', '연천군'],
  ['오산시', '용인시', '의왕시'],
  ['의정부시', '이천시', '파주시'],
  ['평택시', '포천시', '하남시'],
  ['화성시'],
];
const WIDTH = Dimensions.get('window').width;

class ChoiceScreen extends React.Component {
  state = {
    searchCon: '',
    db: null,
    api: null,
    data: [],
    mode: 'loading',
    updateInfo: {},
  };

  constructor(props) {
    super(props);

    this.state.db = new GGDB();
    this.state.api = new ApiMain();
  }

  componentDidMount = () => {
    this.firstCheck();
  };

  firstCheck = async () => {
    const {db} = this.state;

    let cnt = await db.selectMstSigunUseCnt();
    if (cnt === 0) {
      this.setState({mode: 'first'});
      Alert.alert(
        '시군 선택',
        '표시되는 리스트에서 시군을 선택해주세요.',
        [
          {
            text: '확인',
            style: 'default',
          },
        ],
        {cancelable: false},
      );
    } else {
      this.getMstSigun();
    }
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

  getMstSigun = async () => {
    const {db, api} = this.state;

    const sigun = await db.selectMstSigun();

    const length = sigun.length;
    for (let i = 0; i < length && sigun[i].USE_FLAG === 1; i++) {
      sigun[i].API_CNT = await api.getApiSigunCount(sigun[i].SIGUN_NM);
    }

    this.setState({data: sigun, mode: 'select'});

    const selectedSiguns = sigun
      .filter(s => s.USE_FLAG === 1)
      .map(s => s.SIGUN_NM)
      .join('+');
    AsyncStorage.setItem('selectedSiguns', selectedSiguns);
  };

  firstSigunChoice = async sigun => {
    const {db, api} = this.state;
    const {isDownload} = this.props;

    await db.updateMstSigun(sigun, 0, 1);

    if (isDownload) {
      let apiCnt = await api.getApiSigunCount(sigun);
      this.setState({mode: 'update'});
      this.refreshData(sigun, apiCnt);
    } else {
      this.getMstSigun();
    }
  };
  toggleUseFlag = async (sigun, value) => {
    const {api, db} = this.state;
    const {isDownload} = this.props;

    if (value) {
      await db.updateMstSigun(sigun.SIGUN_NM, 0, 1);
      if (isDownload) {
        let apiCnt = await api.getApiSigunCount(sigun.SIGUN_NM);
        this.refreshData(sigun.SIGUN_NM, apiCnt);
      }
    } else {
      this.setState({mode: 'delete'});
      await db.updateMstSigun(sigun.SIGUN_NM, 0, 0);
      await db.deleteGgmoney(sigun.SIGUN_NM);
    }

    this.getMstSigun();
  };

  refreshData(sigun, apiCnt) {
    const {updateInfo} = this.state;

    Alert.alert(
      '데이터 업데이트',
      sigun +
        ' 데이터를 지금 받으시겠습니까?\n' +
        ' 데이터 크기 : 총 ' +
        apiCnt +
        '건 (약 ' +
        Math.round((apiCnt * 0.406) / 1024) +
        'MB)' +
        '\n\n WiFi 환경에서 진행하는 것을 권장합니다.',
      [
        {
          text: '나중에',
          onPress: () => {
            this.getMstSigun();
          },
          style: 'cancel',
        },
        {
          text: '다운로드',
          onPress: () => {
            updateInfo.sigun = sigun;
            updateInfo.dbCount = 0;
            updateInfo.apiCount = apiCnt;
            this.setState({updateInfo: updateInfo, mode: 'update'});

            this.refreshSigunData();
          },
        },
      ],
      {cancelable: false},
    );
  }

  // 시군 데이터 업데이트 Method
  async refreshSigunData() {
    const {db, updateInfo} = this.state;

    // 1. 시군 데이터 delete
    let deletedCnt = await db.deleteGgmoney(updateInfo.sigun);
    console.log(deletedCnt + ' rows deleted.');

    // 2. api data get -> insert to table iterate
    let iterCnt = Math.ceil(updateInfo.apiCount / 1000);
    console.log(iterCnt);
    for (let i = 1; i <= iterCnt; i++) {
      let insertCnt = this.insertThread(updateInfo.sigun, i, 1000);
      console.log('[' + i + '] ' + insertCnt + ' rows insert start');
    }

    // 3. 완료 체크
    if (this.checkInsertFinished(0, 0)) {
      console.log('finished');
    }

    console.log('out : ' + updateInfo.dbCount + '/' + updateInfo.apiCount);
  }

  async checkInsertFinished(rowCnt, errCnt) {
    const {db, updateInfo} = this.state;

    if (updateInfo.dbCount === rowCnt) {
      // insert 오류 발생 횟수
      errCnt = errCnt + 1;
    }

    if (updateInfo.dbCount === updateInfo.apiCount || errCnt >= 10) {
      this.showToast(
        '업데이트 완료 ' +
          updateInfo.dbCount +
          '/' +
          updateInfo.apiCount +
          '(' +
          ((updateInfo.dbCount / updateInfo.apiCount) * 100).toFixed(2) +
          '%)',
      );

      db.updateMstSigun(updateInfo.sigun, updateInfo.dbCount, 1);
      this.getMstSigun();
      return true;
    } else {
      this.showToast(
        '업데이트중... ' +
          updateInfo.dbCount +
          '/' +
          updateInfo.apiCount +
          '(' +
          ((updateInfo.dbCount / updateInfo.apiCount) * 100).toFixed(2) +
          '%)',
        Toast.durations.SHORT,
      );
      return setTimeout(() => {
        console.log(
          'timer : ' + updateInfo.dbCount + '/' + updateInfo.apiCount,
        );
        return this.checkInsertFinished(rowCnt, errCnt);
      }, 2000);
    }
  }
  async insertThread(sigun, index, size) {
    const {db, api, updateInfo} = this.state;

    let testdata = await api.getApiData(sigun, index, size);
    let insertCnt = await db.insertGgmoney(testdata);

    // this.dbCount += testdata.length;
    updateInfo.dbCount += testdata.length;
    this.setState({updateInfo: updateInfo});

    return testdata.length;
  }

  render() {
    const {data, mode, updateInfo} = this.state;
    const {isDownload} = this.props;

    return (
      <>
        {mode === 'first' ? (
          <View style={styles.container}>
            <ScrollView style={styles.scroll}>
              <SafeAreaView>
                <View style={styles.upperContainer}>
                  <Text style={styles.upperText}>시군을 선택해주세요</Text>
                </View>

                <View style={styles.lowerContainer}>
                  {siguns.map((items, row) => {
                    return (
                      <View style={styles.buttonRow}>
                        {items.map((item, col) => {
                          return (
                            <Button
                              style={styles.button}
                              onPress={() => {
                                this.firstSigunChoice(item);
                              }}>
                              <Text style={styles.buttonText}>{item}</Text>
                            </Button>
                          );
                        })}
                      </View>
                    );
                  })}
                </View>
              </SafeAreaView>
            </ScrollView>
          </View>
        ) : (
          <View style={styles.container}>
            {mode === 'select' ? (
              <ScrollView
                contentContainerStyle={styles.contentContainer}
                style={{width: WIDTH}}>
                {data.map((sigun, index) => {
                  return (
                    <View style={styles.itemContainer}>
                      <Text style={styles.itemText}>{sigun.SIGUN_NM}</Text>
                      {sigun.USE_FLAG === 1 && isDownload ? (
                        sigun.ITEM_CNT < sigun.API_CNT ? (
                          <View style={styles.updateCheckContainer}>
                            <View>
                              <CustomButton
                                title="업데이트 필요"
                                titleColor="white"
                                buttonColor="#2788e5"
                                onPress={() =>
                                  this.refreshData(
                                    sigun.SIGUN_NM,
                                    sigun.API_CNT,
                                  )
                                }
                              />
                            </View>
                          </View>
                        ) : (
                          <View style={styles.updateCheckContainer}>
                            <Text style={{color: 'green'}}>
                              최신데이터입니다.
                            </Text>
                          </View>
                        )
                      ) : (
                        <></>
                      )}

                      <Switch
                        trackColor={{false: '#767577', true: '#81b0ff'}}
                        thumbColor={
                          sigun.USE_FLAG === 1 ? '#f5dd4b' : '#f4f3f4'
                        }
                        ios_backgroundColor="#3e3e3e"
                        onValueChange={value => {
                          this.toggleUseFlag(sigun, value);
                        }}
                        value={sigun.USE_FLAG === 1}
                      />
                    </View>
                  );
                })}
              </ScrollView>
            ) : (
              <View>
                <ActivityIndicator />
                {mode === 'update' ? (
                  <View>
                    <Text>다운로드중...</Text>
                    <Text>
                      {updateInfo.dbCount +
                        '/' +
                        updateInfo.apiCount +
                        '(' +
                        (
                          (updateInfo.dbCount / updateInfo.apiCount) *
                          100
                        ).toFixed(2) +
                        '%)'}
                    </Text>
                  </View>
                ) : (
                  <></>
                )}
              </View>
            )}
          </View>
        )}
      </>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    paddingVertical: 20,
    paddingHorizontal: 30,
  },
  itemContainer: {
    flex: 1,
    flexDirection: 'row',
    alignContent: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 30,
    marginVertical: 10,
  },
  itemText: {
    fontSize: 19,
    width: 80,
  },
  updateCheckContainer: {
    flex: 1,
    // flexDirection: 'row',
    // alignContent: 'center',
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginRight: 20,
  },
  scroll: {
    marginHorizontal: 10,
    // marginVertical: 50,
  },
  upperContainer: {
    // flex: 1,
    // height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  upperText: {
    fontSize: 30,
    fontWeight: 'bold',
    // marginTop: 50,
  },
  lowerContainer: {
    flex: 1,
    // height: 100,
  },
  buttonRow: {
    flexDirection: 'row',
  },
  button: {
    width: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
    marginHorizontal: 10,
  },
  buttonText: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
  },
});

export default ChoiceScreen;
