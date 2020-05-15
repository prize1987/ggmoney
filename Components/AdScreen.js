import React from 'react';
import {View, Platform} from 'react-native';
import {BannerAd, BannerAdSize, TestIds} from '@react-native-firebase/admob';
import admob, {MaxAdContentRating} from '@react-native-firebase/admob';
import {ADMOB_KEY_ANDROID, ADMOB_KEY_IOS} from 'react-native-dotenv';

admob()
  .setRequestConfiguration({
    // Update all future requests suitable for parental guidance
    maxAdContentRating: MaxAdContentRating.PG,

    // Indicates that you want your content treated as child-directed for purposes of COPPA.
    tagForChildDirectedTreatment: true,

    // Indicates that you want the ad request to be handled in a
    // manner suitable for users under the age of consent.
    tagForUnderAgeOfConsent: true,
  })
  .then(() => {
    // Request config successfully set!
    // console.log('request success');
  })
  .catch(error => {
    console.log(error);
  });

class AdScreen extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      viewHeight: 0,
    };
  }

  render() {
    const uid = Platform.OS === 'ios' ? ADMOB_KEY_IOS : ADMOB_KEY_ANDROID;

    // console.log(Platform.OS + ' : ' + uid);

    return (
      // <View style={{height: this.state.height}}>
      <BannerAd
        // unitId={TestIds.BANNER}
        unitId={uid}
        size={BannerAdSize.FULL_BANNER}
        // requestOptions={{
        //   requestNonPersonalizedAdsOnly: true,
        // }}
        onAdLoaded={function() {
          // console.log('Advert loaded');
        }}
        onAdFailedToLoad={function(error) {
          console.error('Advert failed to load: ', error);
        }}
      />
      // </View>
    );
  }
}

export default AdScreen;
