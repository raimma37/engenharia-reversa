import React from "react";

const ColorModeContext = React.createContext({
  toggleColorMode: () => { },
  setPrimaryColorLight: (_) => { },
  setPrimaryColorDark: (_) => { },
  setAppLogoLight: (_) => { },
  setAppLogoDark: (_) => { },
  setAppLogoFavicon: (_) => { },
  setAppLogoBackgroundLight: (_) => { },
  setAppLogoBackgroundDark: (_) => { },
  setAppLogoHorizontalMenu: (_) => { },
  setAppLogoHorizontalMenuDark: (_) => { },
  appLogoHorizontalMenu: null,
  appLogoHorizontalMenuDark: null,
});

export default ColorModeContext;
