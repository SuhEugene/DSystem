<template>
<!-- TODO: verfified app icons and another -->
    <div class="app-img">
        <!-- <div v-if="app.verified" class="verify"><CheckIcon size="12"/></div> -->
        <img alt="App avatar" :src="app">
    </div>
</template>
<script>
export default {
    name: "AppImg",
    props: ["app"]
}
</script>