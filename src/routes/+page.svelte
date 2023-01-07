<script lang="ts">
    import { onMount } from 'svelte';
    import type {Controller} from '../js/controller';
    import { getGui } from '../js/autogui/autoGui';
    import ChexController from '../js/chex';
    export let controller: ChexController | null = null;

    onMount(async () => {
        const containerDiv: HTMLDivElement | null = document.getElementById("container") as HTMLDivElement;
        controller = new ChexController(
            {container: containerDiv, 
                onLineStartDraw: "M 1.3838445352206784e-08,1.9999999879974808 L 2.519138869153187e-07,2.0 L 1.9999997480861178,2.0 L 1.9999999861615556,1.9999999879974812 L 1.999999964384269,1.9999997506165115 L 1.7143698075418516,2.3580911526203841e-07 L 1.714369764407654,1.090366514612952e-08 L 1.7143695356629658,0.0 L 0.2856305239416741,0.0 L 0.2856302951969901,1.0903664711693196e-08 L 0.28563025206278647,2.3580911348043664e-07 L 3.5615739184644956e-08,1.999999750616507 L 1.3838445352206784e-08,1.9999999879974808 z",
                onLineEndDraw: "M 1.3838445352206784e-08,1.9999999879974808 L 2.519138869153187e-07,2.0 L 1.9999997480861178,2.0 L 1.9999999861615556,1.9999999879974812 L 1.999999964384269,1.9999997506165115 L 1.7143698075418516,2.3580911526203841e-07 L 1.714369764407654,1.090366514612952e-08 L 1.7143695356629658,0.0 L 0.2856305239416741,0.0 L 0.2856302951969901,1.0903664711693196e-08 L 0.28563025206278647,2.3580911348043664e-07 L 3.5615739184644956e-08,1.999999750616507 L 1.3838445352206784e-08,1.9999999879974808 z"
            });
        controller.start();
        
        document.getElementById("exposed-config")?.appendChild(
            getGui(
                {object: (controller as ChexController).config, 
                    titleText: 'Floats Config', 
                    isEditable: true,
                    onAfterUpdate: () => controller?.update()
                }
            )
        );
        
    });

    export const freeze = () => {
        //controller?.freeze();
    }
    export const start = () => {
        console.log("Starting controller " + (controller as any).constructor.name);
        controller?.start();
    }
    export const end = () => {
        console.log("Stopping controller " + (controller as any).constructor.name);
        console.table(JSON.stringify(controller?.field))
        controller?.stop();
    }
    export const clear = () => {
        //controller?.clear();
    }
</script>

<div id="container" class="floaty-container" />

<div style="z-index: 10">
    <div id="exposed-config"></div>
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
        position: fixed;
        top: 0;
        left: 0;
        margin: 0;
        height: 100vh;
        width: 100vw;
        overflow: hidden !important;
        z-index: -1;
    }
 
    .float-square{
        fill:rgb(175, 82, 0);
    }
    
</style>
