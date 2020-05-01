import React from 'react';
import {StatusBar, SafeAreaView, View, StyleSheet, Text} from 'react-native';
import {Footer, FooterTab, Button, Icon} from 'native-base';

import MainScreen from './Components/MainScreen';
import AdScreen from './Components/AdScreen';
import ChoiceScreen from './Components/ChoiceScreen';

class App extends React.Component {
  state = {
    activePage: 'search',
  };

  render() {
    const {activePage} = this.state;

    return (
      <>
        <StatusBar barStyle="dark-content" />
        <SafeAreaView style={styles.bodyContainer}>
          <View style={styles.bodyContainer}>
            <View style={styles.bodyContainer}>
              {activePage === 'search' ? (
                <MainScreen />
              ) : activePage === 'choice' ? (
                <ChoiceScreen />
              ) : (
                <></>
              )}
            </View>
            <Footer>
              <FooterTab>
                <Button
                  vertical
                  active={activePage === 'search'}
                  onPress={() => {
                    this.setState({activePage: 'search'});
                  }}>
                  <Icon active={activePage === 'search'} name="search" />
                  <Text>매장 검색</Text>
                </Button>
                <Button
                  vertical
                  active={activePage === 'choice'}
                  onPress={() => {
                    this.setState({activePage: 'choice'});
                  }}>
                  <Icon active={activePage === 'choice'} name="apps" />
                  <Text>시군 선택</Text>
                </Button>
              </FooterTab>
            </Footer>
          </View>
          <View>
            <AdScreen />
          </View>
        </SafeAreaView>
      </>
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
    height: 50,
  },
});

export default App;
