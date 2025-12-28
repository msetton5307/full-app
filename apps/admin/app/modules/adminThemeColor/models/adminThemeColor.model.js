const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AdminThemeColorSchema = new Schema({
    // Light Mode Starts
    bgColorLight: { type: String, default: '#f8f8f8' },
    cardColorLight: { type: String, default: '#ffffff' },
    cardMutedTextColorLight: { type: String, default: '#b9b9c3' },
    menuBgColorLight: { type: String, default: '#ffffff' },
    menuBrandTextColorLight: { type: String, default: '#7367f0' },
    menuIconColorLight: { type: String, default: '#6e6b7b' },
    menuHeaderTextColorLight: { type: String, default: '#a6a4b0' },
    contentHeaderTextColorLight: { type: String, default: '#636363' },
    formLabelTextColorLight: { type: String, default: '#5e5873' },
    anchorTextColorLight: { type: String, default: '#7367f0' },
    headerTagTextColorLight: { type: String, default: '#5e5873' },
    bodyTextColorLight: { type: String, default: '#6e6b7b' },
    // Light Mode Ends

    // Dark Mode Starts
    bgColorDark: { type: String, default: '#161d31' },
    cardColorDark: { type: String, default: '#283046' },
    cardMutedTextColorDark: { type: String, default: '#676d7d' },
    menuBgColorDark: { type: String, default: '#283046' },
    menuBrandTextColorDark: { type: String, default: '#7367f0' },
    menuIconColorDark: { type: String, default: '#d0d2d6' },
    menuHeaderTextColorDark: { type: String, default: '#676d7d' },
    contentHeaderTextColorDark: { type: String, default: '#d0d2d6' },
    formLabelTextColorDark: { type: String, default: '#d0d2d6' },
    anchorTextColorDark: { type: String, default: '#7367f0' },
    headerTagTextColorDark: { type: String, default: '#d0d2d6' },
    bodyTextColorDark: { type: String, default: '#b4b7bd' },
    // Dark Mode Ends

    isDeleted: { type: Boolean, default: false, enum: [true, false] },
}, { timestamps: true, versionKey: false });


// create the model for admin color and expose it to our app
module.exports = mongoose.model('Admin_theme_color', AdminThemeColorSchema);