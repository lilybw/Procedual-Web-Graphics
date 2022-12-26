<script lang="ts">
    import { onMount } from 'svelte';
    import CloudController from '../js/cloud';
    export let controller: CloudController | null = null;

    onMount(async () => {
        const containerDiv: HTMLDivElement | null = document.querySelector(".floaty-container");
        controller = new CloudController(
            {container: containerDiv});
        controller.start();
    });

    export const freeze = () => {
        //chexController?.freeze();
    }
    export const start = () => {
        controller?.start();
    }
    export const end = () => {
        controller?.stop();
    }
    export const clear = () => {
        //chexController?.clear();
    }
</script>

<div>
    <p>Floats</p>
    <button on:click={freeze}>Freeze</button>
    <button on:click={start}>Start</button>
    <button on:click={end}>End</button>
    <button on:click={clear}>Clear</button>
</div>



<div class="static-background">

    <div class="scale-to-bounds drop-shadow origin">
        <img src="./svg-primitives/67DegTrapezoidHOLLOW.svg" alt=""/>
    </div>
    
    <!--div class="golden-line" style="left:33vw"></div>
    <div class="golden-line" style="left:66vw"></div-->

</div>

<div class="floaty-container" />

<style>
    :root{
        overflow-y: scroll;
        scroll-behavior: smooth;
        
    }
    .origin{
        top:0;
        left:0;
    }
    .scale-to-bounds{
        max-width: 10%;
        max-height: 10%;
        transform: scale(10);
    }
    .drop-shadow{
        filter: drop-shadow(0 0 0.75rem rgb(255, 255, 255));
    }
    .golden-line{
        position: fixed;
        top: 0;
        height: 100vh;
        width: 1px;
        z-index: 1;
        background-image: linear-gradient(rgb(255, 225, 0), rgb(175, 82, 0));
    }
    .static-background{
        display: flex;
        height: 100vh;
        width: 100vw;
        top: 0;
        left: 0;
        background-image: linear-gradient(#333, black);
        position: fixed;
        scroll-behavior: smooth;
        z-index: -1000;
    }
    .floaty-container{
        margin: 0;
        height: 100vh;
        width: 100vw;
        overflow: hidden !important;
    }
 
    .float-square{
        fill:rgb(175, 82, 0);
    }
    
</style>
