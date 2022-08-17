import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TextInput , 
  Dimensions, 
  TouchableOpacity,
} from 'react-native';
import { useFonts } from 'expo-font';
import AsyncStorage from '@react-native-async-storage/async-storage';


const windowWidth = Dimensions.get('window').width;


export default function App() {
  
  /* font */
  const [loaded] = useFonts({
    UbuntuMedium: require('./assets/fonts/Ubuntu-Medium.ttf'),
  });

  /* date */
  const date = new Date();
  const dateArray = {
      year : date.getFullYear(),
      month : String(date.getMonth() + 1).padStart(2,"0"),
      day : String(date.getDate()).padStart(2,"0"),
      week : date.getDay()
  }
  const weekChangeText = [ "Sunday 🖖" ,"Monday 💪😀" ,"Tuesday 😜" ,"Wednesday 😌☕️" ,"Thursday 🤗" ,"Friday 🍻" ,"Saturday 😴" ]

    
  /* item */
  const [input, setInput] = useState('');
  const [items, setItems] = useState({});
  const [modify, setModify] = useState('');

  const STORAGE_KEY = "@ITEMS";


  const setData = async (value) => {
    try {
      const jsonValue = JSON.stringify(value)
      await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
    } catch (e) {
      console.log('saving error');
    }
  }


  const getData = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEY)
      if(jsonValue != null){ 
        const getItem = JSON.parse(jsonValue);
        setItems(getItem);
        const newItems = Object.keys(getItem).map((key) => ( (getItem[key].modify === true) ? {...getItem[key], modify: false } : { ...getItem[key]} ))
        setItems(newItems)
      }else{ 
        //setItems({}) 
      }
    } catch(e) {
      console.log('error reading value');
    }
  }

  useEffect(() => {
    getData()
  } , []);


  useEffect(() => {
    setData(items);
  }, [items])

  const onChange = (inputText) => {
    setInput(inputText)
  }

  const modifyChange = (modify) => {
    setModify(modify)
  }

  const addItem = () => {
    if(input !== ""){
      const newItem = {...items, [Date.now()] : { value : input, modify:false , checked : false }};
      setItems(newItem);
      setInput('');
    }
  }

  const checkedItem = (id) => {
    const newItems = { ...items };
    newItems[id].checked = !newItems[id].checked;
    setItems(newItems);
  }

  const modiBtn = (id , value) => {
    setModify(value);
    const newItems = Object.keys(items).map((key) => ( (key === id) ? {...items[key], modify: !items[key].modify } : { ...items[key], modify: false } ))
    setItems(newItems)
  }
  const modiOkBtn = (id) => {
    const newItems = { ...items };
    newItems[id].value =  modify;
    newItems[id].modify =  false;
    setItems(newItems);
  }

  const delItem = (id) => {
    const modiItems = {...items }
    delete modiItems[id];
    setItems(modiItems);
  }

  if (!loaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
        <View style={styles.header}><Text style={styles.title}>TODOLIST</Text></View>
        <View style={styles.dateContainer}>
          <Text style={styles.date}>{dateArray.year} . {dateArray.month} . {dateArray.day}</Text>
          <Text style={styles.content}>Have a nice {weekChangeText[dateArray.week]}</Text>
        </View>
        <View style={styles.inputContain}>
          <TextInput 
            style={styles.input} 
            placeholder="Add item..." 
            onChangeText={onChange} 
            value={input}
            returnKeyType="done"
            onSubmitEditing={addItem}
          />
        </View>
        <ScrollView style={styles.itemContain}>
          {Object.keys(items).length !== 0 ? 
            Object.keys(items).map((key) => (
              <View 
                style={[styles.itemWrap , items[key].checked ? styles.checkItemWrap : ""]} 
                key={key}  
              >
                <TouchableOpacity 
                  onPress={() => checkedItem(key)}
                >
                    <Text style={styles.checkbox}>{items[key].checked ? "✔️" : ""}</Text>
                </TouchableOpacity>
                {
                  items[key].modify ? 
                  <>
                    <TextInput 
                      style={styles.modiInput} 
                      onChangeText={modifyChange}
                      value = {modify}
                      multiline
                      numberOfLines={4}
                      placeholder="Modify..." 
                      returnKeyType="done"
                      onSubmitEditing={() => modiOkBtn(key)}
                    />
                    <TouchableOpacity onPress={() => modiOkBtn(key)}>
                        <Text style={styles.modiBtn}>📝</Text>
                    </TouchableOpacity>
                  </>
                  :
                  <>
                    <Text style={[styles.itemText, items[key].checked ? styles.checkedItemText : ""]}>
                      {items[key].value}
                    </Text>
                    <TouchableOpacity onPress={() => modiBtn(key , items[key].value)}>
                        <Text style={styles.modiBtn}>📝</Text>
                    </TouchableOpacity>
                  </>
                }
                
                <TouchableOpacity onPress={() => delItem(key)}>
                  <Text style={styles.delBtn}>❌</Text>
                </TouchableOpacity>
              </View>
            ))
            :
            <Text style={styles.empty}>
              There are no registered items...
            </Text>
          }
        </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020631',
    color:'#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  header : {
    width: '100%',
    paddingVertical : 20,
    paddingHorizontal : 10,
    paddingTop: 60,
  },
  title : {
    textAlign : 'center',
    fontSize : 20,
    color : '#fff',
    fontFamily : 'UbuntuMedium'
  }, 
  dateContainer : {} ,
  date : {
    color:'#fff',
    fontSize : 16,
    textAlign : 'center',
    fontFamily : 'UbuntuMedium'
  },
  content : {
    textAlign : 'center',
    color : '#fff',
    fontSize : 25,
    fontFamily : 'UbuntuMedium'
  },
  inputContain : { 
    paddingHorizontal : 10,
    paddingVertical : 20,
    width : windowWidth,
    alignItems : 'center'
  },
  input : {
    backgroundColor : '#fff',
    paddingHorizontal: 10,
    paddingVertical : 10,
    fontSize: 16,
    borderRadius : 5,
    width: '100%',
    maxWidth: 350,
    flexShrink: 1,
  },
  itemContain : {
    display: 'flex',
    width : windowWidth,
    maxWidth : 350,
  },
  itemWrap : { 
    flexDirection : 'row',
    justifyContent : 'space-between',
    alignItems : 'flex-start',
    marginBottom : 15,
    width : '100%',
    flexShrink: 1,
    backgroundColor : '#fff',
    paddingHorizontal : 10,
    paddingVertical : 10,
    borderRadius : 5,
  },
  checkItemWrap : {
    backgroundColor : '#5529dc',
  },
  checkbox : {
    flexShrink: 1,
    borderWidth : 2,
    borderColor : '#7f7f7f',
    textAlign : 'center',
    width: 20,
    height: 20,
    fontSize : 10,
    backgroundColor : '#fff'
  } ,
  itemText : { 
    fontSize : 14,
    flexShrink: 1,
    fontFamily : 'UbuntuMedium',
    fontSize: 14,
    width : '100%',
    paddingHorizontal : 10
  },
  checkedItemText :{
    color : '#fff'
  }, 
  modiBtn : { 
    textAlign : 'center',
    flexShrink: 1,
    marginRight : 10
  },
  delBtn : { 
    textAlign : 'center',
    flexShrink: 1,
  },
  empty : {
    color:'#fff',
    width: '100%',
    textAlign : 'center',
    opacity : 0.5,
  },
  modiInput : { 
    flexShrink: 1,
    width:'100%',
    paddingHorizontal : 10,
    paddingVertical : 5,
    backgroundColor : '#fff',
    borderWidth : 1,
    borderColor : '#7f7f7f',
    marginHorizontal : 10
  }
});
