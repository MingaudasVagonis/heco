import 'react-native-gesture-handler'
import React from 'react'
import {NavigationContainer} from '@react-navigation/native'
import {enableScreens} from 'react-native-screens'
import {createNativeStackNavigator} from 'react-native-screens/native-stack'
import Home from '@views/home.js'
import Library from '@views/library.js'
enableScreens()

const Stack = createNativeStackNavigator()

const options = {
  headerShown: false,
}

const App = _ => (
  <NavigationContainer>
    <Stack.Navigator>
      <Stack.Screen name="Home" component={Home} options={options} />
      <Stack.Screen
        name="Library"
        component={Library}
        options={{...options, stackPresentation: 'modal'}}
      />
    </Stack.Navigator>
  </NavigationContainer>
)

export default App
