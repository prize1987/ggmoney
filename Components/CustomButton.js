import React from 'react';
import {TouchableOpacity, Text, StyleSheet} from 'react-native';

class CustomButton extends React.Component {
  static defaultProps = {
    title: 'untitled',
    buttonColor: '#0000',
    titleColor: '#ffff',
    onPress: () => null,
  };

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <TouchableOpacity
        style={[styles.container, {backgroundColor: this.props.buttonColor}]}
        onPress={this.props.onPress}>
        <Text style={[styles.text, {color: this.props.titleColor}]}>
          {this.props.title}
        </Text>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    // marginBottom: 10,
    marginHorizontal: 2,
    marginVertical: 2,
    paddingHorizontal: 10,
  },
  text: {
    fontSize: 15,
    fontWeight: 'bold',
  },
});

export default CustomButton;
