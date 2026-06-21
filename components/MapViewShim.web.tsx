import React from 'react';
import { View } from 'react-native';

const MapView = React.forwardRef<any, any>(({ children, style }, ref) => {
  return <View style={style}>{children}</View>;
});

const Marker = React.forwardRef<any, any>(({ children }, ref) => {
  return <>{children}</>;
});

const Polyline = () => null;
const UrlTile = () => null;
const PROVIDER_GOOGLE = 'google';

export { Marker, Polyline, UrlTile, PROVIDER_GOOGLE };
export default MapView;
