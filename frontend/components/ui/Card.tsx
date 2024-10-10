import { View, ViewStyle, StyleProp } from 'react-native';

interface CardProps extends React.PropsWithChildren {
    style?: StyleProp<ViewStyle>; // Change ViewStyle to StyleProp<ViewStyle>
}

export default function Card({ children, style = {} }: CardProps) {
    return (
        <View style={[{
            padding: 10,
            borderRadius: 15,
            backgroundColor: "white",
            elevation: 8,
            shadowColor: "#000",
            shadowRadius: 8,
            shadowOffset: { height: 6, width: 0 },
            shadowOpacity: 0.15,
            marginVertical: 5,
        }, style]} // Use array syntax here to allow multiple styles
        >
            {children}
        </View>
    );
}
