import 'react-native-gesture-handler';
import React, {useState} from "react";
import DateTimePicker from '@react-native-community/datetimepicker';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import * as Notifications from 'expo-notifications';
import * as Permissions from 'expo-permissions';
import { StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  TextInput, 
  Keyboard, 
  TouchableWithoutFeedback,
  ImageBackground,
  Image,
  ActivityIndicator,
  Picker,
  ScrollView } from 'react-native';
  import Constants from 'expo-constants';
  import moment from "moment";
  import TimePicker from 'react-native-simple-time-picker';
import { url } from './../../components/url';

  export default class EveReminder extends React.Component{
    constructor(props){
      super(props);
      this.state={
        isStDatePickerVisible: false,
        isEnDatePickerVisible: false,
        isTimePickerVisible: false,
        key:0,
        Stdate: "",
        chStdate: "",
        desc: "",
        eventName: "",
        time: "",
        expoPushToken: '',
      };
      this.hideStDatePicker = this.hideStDatePicker.bind(this);
      this.hideEnDatePicker = this.hideEnDatePicker.bind(this);
      this.hideTimePicker = this.hideTimePicker.bind(this);
      this.handleTimeConfirm = this.handleTimeConfirm.bind(this);
      this.handleStDateConfirm = this.handleStDateConfirm.bind(this);
    }

    hideStDatePicker(){
      this.setState({ isStDatePickerVisible: false});
    };

    hideEnDatePicker(){
      this.setState({ isEnDatePickerVisible: false});
    };

    hideTimePicker(){
      this.setState({ isTimePickerVisible: false});
    };

    async handleStDateConfirm(Stdate) {
      this.hideStDatePicker();
      await this.setState({ chStdate:(Stdate), Stdate:moment(Stdate).format('Do MMMM YYYY')});
    };

    handleTimeConfirm(time) {
      this.hideTimePicker();
      this.setState({ time:moment(time).format('HH : mm')});
    };

    async sendPushNotification(expoPushToken) {
      if(this.state.chStdate===""){
        alert("Please enter the date of Appointment!");
      }
      
      else{
        
        var Stdate = new Date(this.state.chStdate);
        await fetch(url+'/events',{
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userName: this.props.route.params.name,
            title: "Event Reminder",
            data: {key:this.state.key,screen:"EventHome",title:"Event",head:this.state.eventName,desc:this.state.desc},
            body: "It's time for "+this.state.eventName,
            year: Stdate.getFullYear(),
            month: ""+(parseInt(Stdate.getMonth())+1),
            date: Stdate.getDate(),
            hour: this.state.time.split(" : ")[0],
            minutes: this.state.time.split(" : ")[1],
            seconds: "00",
            curr_token: expoPushToken,
            eventName:this.state.eventName,
            description : this.state.desc
          })
        });
        this.props.navigation.navigate('EventHome');
      }
    }

    async registerForPushNotificationsAsync() {
  let token;
  if (Constants.isDevice) {
    const { status: existingStatus } = await Permissions.getAsync(Permissions.NOTIFICATIONS);
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      alert('Failed to get token for push notification! Pls allow app to send notifications for a better experience.');
   //   return;
    }
    //Creates a token.
    token = await Notifications.getExpoPushTokenAsync();
    console.log(token);
    this.setState({expoPushToken:token.data});
  } else {
    alert('Must use physical device for Push Notifications');
  }

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  return token;
}

componentDidMount() {
  this.registerForPushNotificationsAsync();
}

    render(){
console.log(this.props.route.params.name);
      return (

         <ImageBackground
        source={require('../../assets/eveBackground.png')}
        style={styles.back}
        >
        
        <View style={styles.container}>


      <ScrollView>

        <View style={styles.input}>

        <TextInput style={styles.textinput} placeholder="Event" 
        placeholderTextColor="black"
        underlineColorAndroid={'transparent'} 
        value = {this.state.eventName}
        onChange = {(e)=>this.setState({ eventName: e.nativeEvent.text})}/>

        <TouchableOpacity onPress={() => this.setState({ isStDatePickerVisible: true})}>
        <TextInput style={styles.textinput} placeholder="Date" 
        placeholderTextColor="black"
        underlineColorAndroid={'transparent'} 
        editable={false}
        value={this.state.Stdate}
        onTouchStart={() => this.setState({ isStDatePickerVisible: true})}
        />
        </TouchableOpacity>

        <DateTimePickerModal
        isVisible={this.state.isStDatePickerVisible}
        mode="date"
        onConfirm={this.handleStDateConfirm}
        onCancel={() => this.setState({ isStDatePickerVisible: false})}
        />


        <TouchableOpacity onPress={() => this.setState({ isTimePickerVisible: true})}>
        <TextInput style={styles.textinput} placeholder="Time" 
        placeholderTextColor="black"
        underlineColorAndroid={'transparent'} 
        editable={false}
        value={this.state.time}
        onTouchStart={() => this.setState({ isTimePickerVisible: true})}
        />
        </TouchableOpacity>

        <DateTimePickerModal
        isVisible={this.state.isTimePickerVisible}
        mode="time"
        onConfirm={this.handleTimeConfirm}
        onCancel={() => this.setState({ isTimePickerVisible: false})}
        />
        
        <TextInput style={styles.textinputDiary} placeholder="Description (optional)" 
        placeholderTextColor="black" multiline={true}
        underlineColorAndroid={'transparent'} 
        value = {this.state.desc}
        onChange = {(e)=>this.setState({ desc: e.nativeEvent.text})}/>

        <TouchableOpacity style={styles.button} onPress={async () => {
          await this.sendPushNotification(this.state.expoPushToken);
        }}>
        <Text style={styles.btntext}>Set a Reminder  </Text>
        </TouchableOpacity>
        </View>
        </ScrollView>
        </View>
         </ImageBackground>


        );
    }
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: 'rgba(255,255,255,0.3)',
    },

    input: {
      top: 100,
      height: 600,
      paddingLeft: 40,
      paddingRight: 40,
    },

    header: {
      backgroundColor: '#457b9d',
      alignItems: 'center',
      justifyContent: 'center',
      top: 30,
    },

    headerText: {
      color: 'white',
      fontSize: 22,
      padding: 26,
    },

    title: {
      color: '#2BA189',
      fontWeight: 'bold',
      fontSize: 30,
      paddingBottom: 10,
      marginBottom: 40,
      borderBottomColor: 'black',
      borderBottomWidth: 1,

    },

    textinput: {
      color: 'black',
      fontSize: 18,
      alignSelf: 'stretch',
      height: 50,
      paddingTop: 10,
      paddingBottom: 10,
      paddingLeft:10,
      marginBottom: 20,
      borderColor: 'black',
      borderWidth: 1,
      borderRadius: 5,
      textAlignVertical: "top",
      backgroundColor: '#ededfd',
    },

    textinputDiary: {
      color: 'black',
      fontSize: 18,
      backgroundColor: '#ededfd',
      alignSelf: 'stretch',
      height: 150,
      marginBottom: 20,
      borderColor: 'black',
      borderWidth: 1,

      borderRadius: 5,
      textAlignVertical: "top",
      padding: 10,
    },

    button: {
      alignSelf: 'stretch',
      alignItems: 'center',
      padding: 20,
      backgroundColor: '#3D348B',
      borderColor: 'black',
      borderWidth: 1,
      borderRadius: 5,
    },
    btntext: {
      color: '#fff',
      fontSize: 20,
      fontWeight: "bold",
    },

    backBtn: {
      position: 'absolute',
      zIndex: 11,
      left: 20,
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 8,
    },

     back: {
      flex: 1,
      width: '100%',
      height: '100%',
    },
  });