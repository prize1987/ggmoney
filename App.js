import React from 'react';
import {
  StatusBar,
  SafeAreaView,
  View,
  StyleSheet,
  Text,
  AsyncStorage,
} from 'react-native';
import {Footer, FooterTab, Button, Icon} from 'native-base';

import ApiSearchScreen from './Components/ApiSearchScreen';
import MainScreen from './Components/MainScreen';
import AdScreen from './Components/AdScreen';
import FirstScreen from './Components/FirstScreen';
import OptionScreen from './Components/OptionScreen';

class App extends React.Component {
  state = {
    activePage: 'search',
    isDownload: false,
  };

  componentDidMount = () => {
    this.initStatus();
  };

  initStatus = async () => {
    let isDownload = await AsyncStorage.getItem('isDownload');
    // console.log(isDownload);
    // console.log(isDownload === 'true');
    this.setState({
      isDownload: isDownload === 'true',
    });
  };

  render() {
    const {activePage, isDownload} = this.state;

    return (
      <View style={{flex: 1}}>
        <FirstScreen />

        <StatusBar barStyle="dark-content" />
        <SafeAreaView style={styles.bodyContainer}>
          <View style={styles.bodyContainer}>
            <View style={styles.bodyContainer}>
              {activePage === 'search' ? (
                isDownload ? (
                  <MainScreen />
                ) : (
                  <ApiSearchScreen />
                )
              ) : activePage === 'option' ? (
                <OptionScreen />
              ) : (
                <></>
              )}
            </View>
            <Footer>
              <FooterTab>
                <Button
                  vertical
                  active={activePage === 'search'}
                  onPress={async () => {
                    let dlcheck = await AsyncStorage.getItem('isDownload');
                    this.setState({
                      activePage: 'search',
                      isDownload: dlcheck === 'true',
                    });
                  }}>
                  <Icon active={activePage === 'search'} name="search" />
                  <Text>매장 검색</Text>
                </Button>
                <Button
                  vertical
                  active={activePage === 'option'}
                  onPress={() => {
                    this.setState({activePage: 'option'});
                  }}>
                  <Icon active={activePage === 'option'} name="cog" />
                  <Text>옵션</Text>
                </Button>
              </FooterTab>
            </Footer>
          </View>
          <View style={styles.adContainer}>
            <AdScreen />
          </View>
        </SafeAreaView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  bodyContainer: {
    flex: 1,
  },
  adContainer: {
    // backgroundColor: 'purple',
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
  },
});

export default App;
