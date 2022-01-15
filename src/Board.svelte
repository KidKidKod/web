<script>
    export let board = Array(10).fill(Array(10));
</script>

<div class="board">
    {#each board as row}
        <div class="row">
            {#each row as color}
                <div class="cell" data-color={color} />
            {/each}
        </div>
    {/each}
</div>

<style>
    .board {
        height: 100%;
        width: 100%;
    }

    .row {
        display: flex;
        flex-direction: row;
        margin-bottom: 0.2em;
    }

    .row:last-child {
        margin-bottom: 0;
    }

    .cell {
        width: 2em;
        height: 2em;
        border: 1px solid gray;
        margin-left: 0.2em;
    }
</style>
