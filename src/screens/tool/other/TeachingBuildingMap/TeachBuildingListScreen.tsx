import { FlatList, Pressable, StyleSheet, View, Image } from "react-native";
import { Text, useTheme } from "@rneui/themed";
import { TeachBuildingList } from "./data";
import React, { useState } from "react";
import ImageViewing from "react-native-image-viewing";
import { Icon } from "@/components/un-ui/Icon.tsx";

export function TeachBuildingListScreen() {
  const {theme}=useTheme();
  const [ExpandBuildingId,setExpandBuildingId]=useState<string|null>(null);
  const [ExpandFloor,setExpandFloor]=useState<string|null>(null);
  const [viewImageUri,setViewImageUri]=useState<string|null>(null)

  const openViewer=(imageSource: any) => {
    const resolvedImage=Image.resolveAssetSource(imageSource);
    if(resolvedImage?.uri){
      setViewImageUri(resolvedImage.uri);
    }
  };
  return(
    <View style={styles.container}>
      <FlatList
        data={TeachBuildingList}
        keyExtractor={(item)=>item.id}
        ListFooterComponent={ExpandBuildingId && !ExpandFloor?<View style={styles.bottomSpacer}/>:null}
        renderItem={({item})=>(
          <View style={styles.section}>
            <Pressable
              style={styles.item}
              onPress={()=>{
                setExpandBuildingId((current) => {
                  const nextBuildingId=current===item.id?null:item.id;
                  setExpandFloor(null);
                  return nextBuildingId;
                });
              }}
            >
              <View style={styles.titleRow}>
                <Text style={[styles.itemText,{color: theme.colors.black}]}>
                  {item.name}
                </Text>
                <Icon
                  name={ExpandBuildingId===item.id?"chevron-down":"chevron-right"}
                  size={22}
                  color={theme.colors.black}
                />
              </View>
            </Pressable>
            {ExpandBuildingId===item.id&&(
              <View style={styles.floorList}>
                {item.floors.map((floor) => {
                  const floorKey=`${item.id}-${floor.id}`;
                  const isFloorExpanded=ExpandFloor===floorKey;
                  return (
                    <View key={floorKey}>
                      <Pressable
                        style={styles.floorItem}
                        onPress={()=>
                          setExpandFloor((current) => (current===floorKey?null:floorKey))
                        }
                      >
                        <View style={styles.titleRow}>
                          <Text style={[styles.floorText,{color:theme.colors.black}]}>
                            {floor.name}
                          </Text>
                          <Icon
                            name={isFloorExpanded?"chevron-down":"chevron-right"}
                            size={20}
                            color={theme.colors.black}
                          />
                        </View>
                      </Pressable>
                      {isFloorExpanded&&(
                        <View style={styles.previewCard}>
                          <Pressable
                            style={styles.previewImageButton}
                            onPress={()=>openViewer(floor.image)}
                          >
                            <Image source={floor.image}style={styles.previewImage} resizeMode="contain"/>
                          </Pressable>
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        )}
      />
      <ImageViewing
        images={viewImageUri?[{uri:viewImageUri}]:[]}
        imageIndex={0}
        visible={!!viewImageUri}
        onRequestClose={()=>setViewImageUri(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container:{
    flex:1,
    padding:12,
  },
  item:{
    padding:16,
    borderRadius:12,
    marginBottom:4,
    backgroundColor:"#ffffff",
  },
  titleRow:{
    flexDirection:"row",
    alignItems:"center",
    justifyContent:"space-between",
  },
  floorList:{
    paddingTop:8,
    paddingHorizontal:8,
  },
  floorItem:{
    paddingHorizontal:16,
    paddingVertical:12,
    borderRadius:10,
    marginTop:8,
    backgroundColor:"#f3f4f6",
  },
  section:{
    marginBottom:0,
  },
  floorText:{
    fontSize:15,
    fontWeight:"500",
  },
  previewCard:{
    marginTop:8,
    padding:8,
    borderRadius:12,
    backgroundColor:"#ffffff",
  },
  previewImageButton:{
    width:"100%",
  },
  previewImage:{
    width:"100%",
    height:260,
  },
  bottomSpacer:{
    height:280,
  },
  itemText:{
    fontSize:16,
    fontWeight:"600",
    },
});
