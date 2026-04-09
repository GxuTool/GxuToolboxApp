import{FlatList,Pressable,StyleSheet,View} from "react-native";
import{Text,useTheme} from "@rneui/themed";
import{TeachBuildingList}from"./data";
import{useNavigation} from "@react-navigation/native";

export function TeachBuildingListScreen(){
    const{theme}=useTheme();
    const navigation=useNavigation();
    return (
        <View style={styles.container}>
            <FlatList data={TeachBuildingList}
                  keyExtractor={item=>item.id}
                      renderItem={({item})=>(
                          <Pressable style={styles.item}
                              onPress={()=>navigation.navigate("FloorListScreen",{building:item})}>
                              <Text style={[styles.itemText,{color:theme.colors.black}]}>
                                  {item.name}
                              </Text>
                          </Pressable>
                      )}
            />
        </View>

    );
}

const styles=StyleSheet.create({
    container:{
        flex:1,
        padding:12,
    },
    item:{
        padding:16,
        borderRadius:12,
        marginBottom:12,
        backgroundColor:"#ffffff"
    },
    itemText:{
        fontSize:16,
        fontWeight:"600",
    },
});

