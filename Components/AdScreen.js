import React from 'react';
import { View, Platform, AsyncStorage } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from '@react-native-firebase/admob';
import admob, { MaxAdContentRating } from '@react-native-firebase/admob';
import { ADMOB_KEY_ANDROID, ADMOB_KEY_IOS } from 'react-native-dotenv';

class AdScreen extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoaded: false,
    };
  }

  componentDidMount() {
    AsyncStorage.getItem('adOff').then(adOff => {
      if (adOff !== 'true') {
        this.loadAd();
      }
    });
  }

  loadAd = () => {
    admob()
      .setRequestConfiguration({
        // Update all future requests suitable for parental guidance
        maxAdContentRating: MaxAdContentRating.T,

        // Indicates that you want your content treated as child-directed for purposes of COPPA.
        // tagForChildDirectedTreatment: true,

        // Indicates that you want the ad request to be handled in a
        // manner suitable for users under the age of consent.
        // tagForUnderAgeOfConsent: true,
      })
      .then(() => {
        // Request config successfully set!
        console.log('request success');
        this.setState({ isLoaded: true });
      })
      .catch(error => {
        console.log(error);
        this.setState({ isLoaded: false });
      });
  };

  render() {
    const uid = Platform.OS === 'ios' ? ADMOB_KEY_IOS : ADMOB_KEY_ANDROID;
    const { isLoaded } = this.state;

    // console.log(Platform.OS + ' : ' + uid);

    return (
      isLoaded && (
        <BannerAd
          // unitId={TestIds.BANNER}
          unitId={uid}
          size={BannerAdSize.SMART_BANNER}
          // requestOptions={{
          //   requestNonPersonalizedAdsOnly: true,
          // }}
          onAdLoaded={() => {
            // this.setState({bannerVisible: false});
            console.log('Advert loaded');
            this.setState({ isLoaded: true });
          }}
          onAdFailedToLoad={error => {
            console.log('Advert failed to load: ', error);
            this.setState({ isLoaded: false });
          }}
        />
      )
    );
  }
}

export default AdScreen;
