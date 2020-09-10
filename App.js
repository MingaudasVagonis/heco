import 'react-native-gesture-handler'
import React, {useEffect, useState, useRef} from 'react'
import {View} from "react-native"
import {NavigationContainer} from '@react-navigation/native'
import {enableScreens} from 'react-native-screens'
import {createNativeStackNavigator} from 'react-native-screens/native-stack'
import Home from '@views/home.js'
import Library from '@views/library.js'
import Setup from "@views/setup.js"
import {getBool} from "@logic/device.js"

enableScreens()

const Stack = createNativeStackNavigator()

const options = {
  headerShown: false,
}

const App = _ => {

  const [loaded, setLoaded] = useState(false)
  const setup = useRef(true)

  useEffect(() => {
    const load = async () => {
      setup.current = await getBool("setup")
      setLoaded(true)
    }

    load()
  }, [])

  if(!loaded)
    return <View/>

  return(<NavigationContainer>
    <Stack.Navigator>
      {!setup.current ? <Stack.Screen name="Setup" component={Setup} options={options} /> : null}
      <Stack.Screen name="Home" component={Home} options={options} />
      <Stack.Screen
        name="Library"
        component={Library}
        options={{...options, stackPresentation: 'modal'}}
      />
    </Stack.Navigator>
  </NavigationContainer>)
}

export default App
