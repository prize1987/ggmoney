import React from 'react';
import {StyleSheet, Modal, SafeAreaView, Image, Dimensions} from 'react-native';

const WIDTH = Dimensions.get('window').width;

class FirstScreen extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      logoVisible: true,
    };
  }

  componentDidMount = () => {
    return setTimeout(() => {
      this.setState({logoVisible: false});
    }, 1000);
  };

  render() {
    return (
      <>
        <Modal visible={this.state.logoVisible}>
          <SafeAreaView style={styles.loadContainer}>
            <Image
              style={{height: WIDTH - 50, width: WIDTH - 50}}
              source={require('../img/logo.png')}
            />
          </SafeAreaView>
        </Modal>
      </>
    );
  }
}

const styles = StyleSheet.create({
  loadContainer: {
    flex: 1,
    backgroundColor: 'rgba(35, 94, 166, 1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default FirstScreen;
