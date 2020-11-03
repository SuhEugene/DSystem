<template>
<!-- TODO: verfified app icons and another -->
    <div class="app-img">
        <div v-if="app.level == 0" class="app-badge app-badge--gray" tooltip="Сомнительное"><CheckIcon size="12"/></div>
        <!-- <div v-if="app.level == 1" class="app-badge" tooltip="Hello"><CheckIcon size="12"/></div> -->
        <div v-if="app.level == 2" class="app-badge" tooltip="Подтверждённое"><CheckIcon size="12"/></div>
        <div v-if="app.level == 3" class="app-badge" tooltip="Официальное"><CheckIcon size="12"/></div>
        <div class="app-image">
            <img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" :style="`background-image: url('${app.avatar}')`">
            <!-- <img src="img_orange_flowers.jpg" alt="Flowers" style="width:auto;"> -->
            <div><SailBoatIcon size="48" /></div>
        </div>
    </div>
</template>
<script>
import CheckIcon from "mdi-vue/Check.vue";
import SailBoatIcon from "mdi-vue/SailBoat.vue";
// https://www.penpublishing.com/squaresMobileTest.jpg
export default {
    name: "AppImg",
    props: ["app"],
    components: { CheckIcon, SailBoatIcon }
}
</script>