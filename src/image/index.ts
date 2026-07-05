import placeholderImage from "./placeholder.svg";
import blankImage from "./blank.png";

// SDN 01
import sdn1Hero from "./SchoolDetail/SDN_01/Ruang Kelas/Kelas_1/Depan.jpeg";
import sdn1HeroBack from "./SchoolDetail/SDN_01/Ruang Kelas/Kelas_1/Belakang.jpeg";
import sdn1Principal from "./SchoolDetail/SDN_01/Staff/Headmaster.png";
import sdn1Toilet1 from "./SchoolDetail/SDN_01/Ruang Kelas/Toilet/toilet_1.jpeg";
import sdn1Toilet2 from "./SchoolDetail/SDN_01/Ruang Kelas/Toilet/toilet_2.jpeg";
import sdn1Bangunan from "./SchoolDetail/SDN_01/bangunan.jpg";

// SDN 02
import sdn2Hero from "./SchoolDetail/SDN_02/Ruang Kelas/Kelas_1/Depan.jpeg";
import sdn2Bangunan from "./SchoolDetail/SDN_02/Bangunan.png";
import sdn2Principal from "./SchoolDetail/SDN_02/Staff/Headmaster.png";
import sdn2Toilet1 from "./SchoolDetail/SDN_02/Ruang Kelas/Toilet/toilet_1.jpeg";

// SDN 03
import sdn3Hero from "./SchoolDetail/SDN_03/Ruang Kelas/Kelas_1/Depan.jpeg";
import sdn3Principal from "./SchoolDetail/SDN_03/Staff/Headmaster.jpeg";
import sdn3Bangunan1 from "./SchoolDetail/SDN_03/Bangunan.jpeg";

// SDN 04
import sdn4Hero from "./SchoolDetail/SDN_04/Ruang Kelas/Kelas_1/Depan.png";
import sdn4Principal from "./SchoolDetail/SDN_04/Staff/Headmaster.jpeg";
import sdn4Bangunan1 from "./SchoolDetail/SDN_04/Bangunan.png";

export const schoolImageAssets = {
  placeholder: placeholderImage,
  blank: blankImage,
  sdn1: {
    hero: sdn1Bangunan || sdn1Hero,
    heroBack: sdn1HeroBack,
    card: sdn1Bangunan || sdn1Hero,
    principal: sdn1Principal,
    classroom: sdn1Hero,
    toilet1: sdn1Toilet1,
    toilet2: sdn1Toilet2,
    gallery: [sdn1Bangunan || sdn1Hero, sdn1HeroBack, sdn1Toilet1],
  },
  sdn2: {
    hero: sdn2Bangunan || sdn2Hero,
    card: sdn2Bangunan || sdn2Hero,
    principal: sdn2Principal,
    classroom: sdn2Hero,
    toilet1: sdn2Toilet1,
    bangunan1: sdn2Bangunan,
    gallery: [sdn2Bangunan || sdn2Hero],
  },
  sdn3: {
    hero: sdn3Bangunan1 || sdn3Hero,
    card: sdn3Bangunan1 || sdn3Hero,
    principal: sdn3Principal,
    classroom: sdn3Hero,
    bangunan1: sdn3Bangunan1,
    gallery: [sdn3Bangunan1 || sdn3Hero, sdn3Hero],
  },
  sdn4: {
    hero: sdn4Bangunan1 || sdn4Hero,
    card: sdn4Bangunan1 || sdn4Hero,
    principal: sdn4Principal,
    classroom: sdn4Hero,
    bangunan1: sdn4Bangunan1,
    gallery: [sdn4Bangunan1 || sdn4Hero, sdn4Hero],
  },
};
