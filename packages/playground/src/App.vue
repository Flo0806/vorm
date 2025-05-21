<template>
  <nav style="padding: 1rem; border-bottom: 1px solid #ccc">
    <router-link to="/basics">Basics Demo</router-link> |
    <router-link to="/registration">Registration Demo</router-link> |
    <router-link to="/validation-modes">Validation Modes Demo</router-link> |
    <router-link to="/validation-modes-custom"
      >Validation Modes Custom Controls Demo</router-link
    >
    | <router-link to="/autovorm-basics">AutoVorm Basics</router-link> |
    <router-link to="/autovorm-extended">AutoVorm Extended</router-link> |
    <router-link to="/autovorm-splitted">AutoVorm Splitted</router-link> |
    <router-link to="/autovorm-big">AutoVorm Big</router-link> |
    <router-link to="/autovorm-showif">AutoVorm ShowIf</router-link> |
    <router-link to="/autovorm-repeater">AutoVorm Repeater</router-link>
  </nav>
  <router-view />
</template>
