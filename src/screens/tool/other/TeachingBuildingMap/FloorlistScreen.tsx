import{FlatList,StyleSheet,View} from "react-native";
import {UnPressable} from "@/components/un-ui";
import{Text,useTheme} from "@rneui/themed";
import {useNavigation} from "@react-navigation/native";

export function FloorlistScreen({route}:any){
    const {theme}=useTheme();
    const {building}=route.params;
    const navigation=useNavigation();
    return (
        <View style={styles.container}>
            <FlatList data={building.floors}
                      keyExtractor={item=>item.id}
                      renderItem={({item})=>(
                          <UnPressable style={styles.item}
                          onPress={function(){ return navigation.navigate("FloorMapScreen",{floor:item}); }}>
                              <Text style={[styles.itemText,{color:theme.colors.black}]}>
                                  {item.name}
                              </Text>
                          </UnPressable>
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
        backgroundColor:"theme.colors.white",
    },
    itemText:{
        fontSize:16,
        fontWeight:"600",
    },
});
