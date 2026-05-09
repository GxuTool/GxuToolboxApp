import{Image,ScrollView,StyleSheet} from "react-native";
import {UnPressable} from "@/components/un-ui";
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
            <UnPressable style={styles.imageButton}onPress={function(){return setclick(true);}}>
            <Image source={floor.image}style={styles.image}resizeMode="contain"/>
            </UnPressable>
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
