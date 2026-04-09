import{Image,ScrollView,StyleSheet,Pressable} from "react-native";
import React,{useState} from "react";
import ImageViewing from "react-native-image-viewing";

export function FloorMapScreen({route}:any){
    const {floor}=route.params;
    const [click, setclick] = useState(false);
    const resolvedImage=Image.resolveAssetSource(floor.image);
    const images=resolvedImage?.uri?[{uri:resolvedImage.uri}]:[];

    return(
        <>
        <ScrollView contentContainerStyle={styles.container}>
            <Pressable style={styles.imageButton}onPress={()=>setclick(true)}>
            <Image source={floor.image}style={styles.image}resizeMode="contain"/>
            </Pressable>
        </ScrollView>
    <ImageViewing
        images={images}
        imageIndex={0}
        visible={click}
        onRequestClose={() => setclick(false)}
    />
        </>
    );
}

const styles=StyleSheet.create({
    container:{
        flexGrow:1,
        justifyContent:"center",
        alignItems:"center",
        padding:12,
    },
    imageButton:{
        width:"100%",
    },
    image:{
        width:"100%",
        height:600,
    },
});
