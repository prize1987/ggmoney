import React from 'react';
import {
  StatusBar,
  SafeAreaView,
  View,
  StyleSheet,
  Text,
  AsyncStorage,
  Platform,
} from 'react-native';
import {Footer, FooterTab, Button, Icon} from 'native-base';

import SearchScreenApi from './Components/SearchScreenApi';
import SearchScreenDb from './Components/SearchScreenDb';
import AdScreen from './Components/AdScreen';
import FirstScreen from './Components/FirstScreen';
import OptionScreen from './Components/OptionScreen';
import MapScreenDb from './Components/MapScreenDb';
import MapScreenApi from './Components/MapScreenApi';

class App extends React.Component {
  state = {
    activePage: 'search',
    isDownload: false,
    isSave: false,
  };

  componentDidMount = () => {
    this.initStatus();
  };

  initStatus = async () => {
    let isDownload = await AsyncStorage.getItem('isDownload');
    this.setState({isDownload: isDownload === 'true'});

    let activePage = await AsyncStorage.getItem('activePage');
    if (activePage !== null) {
      this.setState({activePage: activePage});
    }
  };

  callMapSearch = async addr => {
    await AsyncStorage.setItem('addrRequest', addr);

    this.setState({activePage: 'map'});
  };

  render() {
    const {activePage, isDownload} = this.state;

    return (
      <View style={{flex: 1}}>
        {/* <FirstScreen /> */}

        <StatusBar barStyle="dark-content" />
        <SafeAreaView style={styles.bodyContainer}>
          <View style={styles.bodyContainer}>
            <View style={styles.bodyContainer}>
              {activePage === 'search' ? (
                isDownload ? (
                  <SearchScreenDb callMapSearch={this.callMapSearch} />
                ) : (
                  <SearchScreenApi callMapSearch={this.callMapSearch} />
                )
              ) : activePage === 'map' ? (
                isDownload ? (
                  <MapScreenDb />
                ) : (
                  <MapScreenApi />
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
                  style={
                    activePage === 'search'
                      ? styles.footerButtonActive
                      : styles.footerButton
                  }
                  vertical
                  active={activePage === 'search'}
                  onPress={async () => {
                    let dlcheck = await AsyncStorage.getItem('isDownload');
                    this.setState({
                      activePage: 'search',
                      isDownload: dlcheck === 'true',
                    });
                    AsyncStorage.setItem('activePage', 'search');
                  }}>
                  <Icon
                    style={
                      activePage === 'search'
                        ? styles.footerIconActive
                        : styles.footerIcon
                    }
                    active={activePage === 'search'}
                    name="search"
                  />
                  <Text>매장 검색</Text>
                </Button>
                <Button
                  style={
                    activePage === 'map'
                      ? styles.footerButtonActive
                      : styles.footerButton
                  }
                  vertical
                  active={activePage === 'map'}
                  onPress={async () => {
                    let dlcheck = await AsyncStorage.getItem('isDownload');
                    this.setState({
                      activePage: 'map',
                      isDownload: dlcheck === 'true',
                    });
                    AsyncStorage.setItem('activePage', 'map');
                  }}>
                  <Icon
                    style={
                      activePage === 'map'
                        ? styles.footerIconActive
                        : styles.footerIcon
                    }
                    active={activePage === 'map'}
                    name="map"
                  />
                  <Text>지도 검색</Text>
                </Button>
                <Button
                  style={
                    activePage === 'option'
                      ? styles.footerButtonActive
                      : styles.footerButton
                  }
                  vertical
                  active={activePage === 'option'}
                  onPress={() => {
                    this.setState({activePage: 'option'});
                  }}>
                  <Icon
                    style={
                      activePage === 'option'
                        ? styles.footerIconActive
                        : styles.footerIcon
                    }
                    active={activePage === 'option'}
                    name="md-settings"
                  />
                  <Text>옵션</Text>
                </Button>
              </FooterTab>
            </Footer>
          </View>
          {/* <View style={styles.adContainer}> */}
          <AdScreen />
          {/* </View> */}
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
  footerButton: {
    backgroundColor: 'rgba(248, 248, 248, 1)',
  },
  footerButtonActive: {
    backgroundColor: 'rgba(208, 225, 247, 1)',
  },
  footerIcon: {
    color: 'rgba(107, 107, 107, 1)',
  },
  footerIconActive: {
    color: 'rgba(47, 124, 246, 1)',
  },
});

export default App;
