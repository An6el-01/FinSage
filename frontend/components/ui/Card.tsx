import { View, ViewStyle, StyleProp } from 'react-native';

interface CardProps extends React.PropsWithChildren {
    style?: StyleProp<ViewStyle>; // Change ViewStyle to StyleProp<ViewStyle>
}

export default function Card({ children, style = {} }: CardProps) {
    return (
        <View style={[{
            padding: 15,
            borderRadius: 12,
            marginVertical: 10,
            backgroundColor: 'white',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 6,
            elevation: 5,
        }, style]} // Use array syntax here to allow multiple styles
        >
            {children}
        </View>
    );
}
