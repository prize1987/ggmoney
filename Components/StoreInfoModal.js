import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableHighlight,
  Clipboard,
  Linking,
  Platform,
  Alert,
} from 'react-native';

class StoreInfoModal extends React.Component {
  constructor(props) {
    super(props);
  }

  writeToClipboard = async (itemName, itemValue) => {
    await Clipboard.setString(itemValue);
    this.props.showToast(itemName + '가 복사되었습니다.');
    this.props.onClose();
  };

  render() {
    return (
      <TouchableHighlight
        style={styles.centeredView}
        onPress={() => {
          this.props.onClose();
        }}
        underlayColor="rgba(0,0,0,0)">
        <View style={styles.modalView}>
          <Text style={styles.modalText}>{this.props.item.CMPNM_NM}</Text>
          <Text style={styles.modalTextSub}>{this.props.item.INDUTYPE_NM}</Text>
          {this.props.item.REFINE_LOTNO_ADDR && (
            <TouchableHighlight
              style={styles.buttonContainer}
              onPress={() => {
                this.writeToClipboard(
                  '지번주소',
                  this.props.item.REFINE_LOTNO_ADDR,
                );
              }}>
              <Text>지번주소 복사</Text>
            </TouchableHighlight>
          )}
          {this.props.item.REFINE_ROADNM_ADDR && (
            <TouchableHighlight
              style={styles.buttonContainer}
              onPress={() => {
                this.writeToClipboard(
                  '도로명주소',
                  this.props.item.REFINE_ROADNM_ADDR,
                );
              }}>
              <Text>도로명주소 복사</Text>
            </TouchableHighlight>
          )}
          {this.props.mapButtonEnabled &&
            (this.props.item.REFINE_LOTNO_ADDR ||
              this.props.item.REFINE_ROADNM_ADDR) && (
              <TouchableHighlight
                style={styles.buttonContainer}
                onPress={() => {
                  let addr = this.props.item.REFINE_LOTNO_ADDR
                    ? this.props.item.REFINE_LOTNO_ADDR
                    : this.props.item.REFINE_ROADNM_ADDR
                    ? this.props.item.REFINE_ROADNM_ADDR
                    : '';
                  if (addr !== null && addr !== undefined && addr.length > 0) {
                    this.props.callMapSearch(addr);
                  } else {
                    this.props.showToast('주소 정보가 없습니다');
                  }
                }}>
                <Text>지도에서 보기</Text>
              </TouchableHighlight>
            )}

          {Platform.OS === 'android' && (
            <TouchableHighlight
              style={styles.buttonContainer}
              onPress={() => {
                const APP_STORE_LINK =
                  'itms-apps://itunes.apple.com/us/app/apple-store/id311867728?mt=8';
                const PLAY_STORE_LINK =
                  'market://details?id=com.nhn.android.nmap';
                let nmapUrl = 'nmap://search';
                let nmapUrlParams = '';

                // nmapUrlParams += "?lat=" + this.props.item.REFINE_WGS84_LAT;
                // nmapUrlParams += "&lng=" + this.props.item.REFINE_WGS84_LOGT;
                nmapUrlParams +=
                  '?query=' +
                  (this.props.item.REFINE_LOTNO_ADDR
                    ? this.props.item.REFINE_LOTNO_ADDR
                    : this.props.item.REFINE_ROADNM_ADDR);

                nmapUrlParams += '&appname=com.yoongi.ggmoney';
                nmapUrl += nmapUrlParams;

                console.log(nmapUrl);
                Linking.openURL(nmapUrl)
                  .then(supported => {
                    console.log(supported);
                  })
                  .catch(err => {
                    Alert.alert(
                      '',
                      '네이버지도 App이 존재하지 않습니다.\n다운로드받으시겠습니까?',
                      [
                        {
                          text: '예',
                          onPress: () => {
                            Platform.OS === 'ios'
                              ? Linking.openURL(APP_STORE_LINK)
                              : Linking.openURL(PLAY_STORE_LINK);
                          },
                        },
                        {
                          text: '아니오',
                          style: 'cancel',
                        },
                      ],
                    );
                    console.log(err);
                  });
              }}>
              <Text>네이버지도 App 연결</Text>
            </TouchableHighlight>
          )}
          {this.props.item.TELNO && (
            <TouchableHighlight
              style={styles.buttonContainer}
              onPress={() => {
                let telNo = this.props.item.TELNO.replace(/\D/g, '');
                Linking.openURL('tel:' + telNo);
              }}>
              <Text>매장에 전화걸기</Text>
            </TouchableHighlight>
          )}

          <TouchableHighlight
            style={{...styles.openButton, backgroundColor: '#2196F3'}}
            onPress={() => {
              this.props.onClose();
            }}>
            <Text style={styles.textStyle}>닫기</Text>
          </TouchableHighlight>
        </View>
      </TouchableHighlight>
    );
  }
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // marginTop: 22,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  openButton: {
    marginTop: 40,
    backgroundColor: '#F194FF',
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    width: 120,
    height: 40,
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    // marginBottom: 30,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalTextSub: {
    marginBottom: 30,
    fontSize: 13,
    // fontWeight: 'bold',
    textAlign: 'center',
  },

  buttonContainer: {
    // alignSelf: 'center',
    marginBottom: 10,
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

export default StoreInfoModal;
