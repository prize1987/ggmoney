import React from 'react';
import {View, StyleSheet, Text, AsyncStorage} from 'react-native';
import {Card, CardItem, Switch} from 'native-base';

import ChoiceScreen from './ChoiceScreen';
import GGDB from './Database';

class OptionScreen extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isDownload: false,
      db: new GGDB(),
    };

    this.initStatus();
  }

  initStatus = async () => {
    let isDownload = await AsyncStorage.getItem('isDownload');
    // console.log(isDownload);
    // console.log(isDownload === 'true');
    this.setState({
      isDownload: isDownload === 'true',
    });
  };

  downloadToggle = async () => {
    const {db, isDownload} = this.state;
    if (isDownload) {
      await AsyncStorage.removeItem('isDownload');
      await db.deleteGgmoneyAll();
      await db.initMstSigun();
    } else {
      await AsyncStorage.setItem('isDownload', 'true');
    }
    this.setState({isDownload: !isDownload});
  };

  render() {
    const {isDownload} = this.state;
    return (
      <View style={styles.container}>
        <View style={styles.topContainer}>
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
  cardItemSubText: {
    fontSize: 12,
    paddingLeft: 10,
    // paddingTop: 10,
    color: 'gray',
  },
});

export default OptionScreen;
