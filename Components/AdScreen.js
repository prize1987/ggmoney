import React from 'react';
import {Platform, Text} from 'react-native';
import {BannerAd, BannerAdSize, TestIds} from '@react-native-firebase/admob';
import admob, {MaxAdContentRating} from '@react-native-firebase/admob';

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
    console.log('request success');
  });

class AdScreen extends React.Component {
  render() {
    const uid =
      Platform.OS === 'ios'
        ? 'ca-app-pub-2933849600819980/2370173270'
        : 'ca-app-pub-2933849600819980/1912035942';

    console.log(uid);
    return (
      <BannerAd
        // unitId={TestIds.BANNER}
        unitId={uid}
        size={BannerAdSize.SMART_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
        onAdLoaded={function() {
          console.log('Advert loaded');
        }}
        onAdFailedToLoad={function(error) {
          console.error('Advert failed to load: ', error);
        }}
      />
    );
  }
}

export default AdScreen;
