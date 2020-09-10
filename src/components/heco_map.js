import React, {useRef} from 'react'
import {View, StyleSheet, Text, Image, Pressable} from 'react-native'
import {sys_width, round_fac, getText} from '@styles'
import {HMarker} from './heco_marker.js'
import colors from '@colors'
import MapView from 'react-native-map-clustering'
import {BlurView} from '@react-native-community/blur'

const HMap = ({entries, locationEnabled, request}) => {
  const map = useRef(undefined)

  const markers = entries ? entries.filter(e => e.latitude) : []

  const fit = () =>
    setTimeout(() => map.current?.fitToCoordinates(markers), 1000)

  return (
    <View style={styles.container}>
      <MapView
        ref={map}
        onMapReady={fit}
        style={styles.map}
        initialRegion={initialRegion}
        toolbarEnabled={false}
        zoomControlEnabled={false}
        showsScale={false}
        showsMyLocationButton={false}
        showsUserLocation={false}
        mapType="mutedStandard"
        clusterFontFamily="SFProDisplay-Heavy"
        clusterColor={colors.main}
        mapPadding={defaultMapPadding}>
        {markers.map(entry => (
          <HMarker coordinate={entry} key={entry.time} />
        ))}
      </MapView>
      {!locationEnabled ? (
        <>
          <BlurView style={styles.blur} blurType="dark" blurAmount={10} />
          <Pressable style={styles.blur_content} onPress={request}>
            <Image
              source={require('@assets/icons/icon_location.png')}
              style={styles.location_icon}
            />
            <View style={styles.text_parent}>
              <Text style={styles.text_main}>enable</Text>
              <Text style={styles.text}>location</Text>
            </View>
          </Pressable>
        </>
      ) : null}
    </View>
  )
}

export default HMap

const styles = StyleSheet.create({
  container: {
    //width: sys_width * 0.95,
    flex: 1,
    marginRight: 0.025 * sys_width,
    borderRadius: round_fac * 25,
    height: sys_width * 0.5,
  },
  map: {
    borderRadius: round_fac * 22,
    width: '100%',
    height: '100%',
  },
  blur: {
    width: '100%',
    height: '100%',
    borderRadius: round_fac * 23,
    position: 'absolute',
  },
  blur_content: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    flexDirection: 'row',
  },
  text_parent: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  location_icon: {
    width: sys_width * 0.07,
    height: sys_width * 0.07,
    marginRight: sys_width * 0.015,
  },
  text_main: {
    color: 'white',
    ...getText('heavy', 0.06),
  },
  text: {
    color: 'white',
    ...getText('bold', 0.04),
    marginTop: -3,
  },
})

const initialRegion = {
  latitude: 55.390094,
  longitude: 23.777917,
  latitudeDelta: 3,
  longitudeDelta: 3,
}

const defaultMapPadding = {left: 3, bottom: 3, top: 3, right: 3}
