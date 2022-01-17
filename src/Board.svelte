<script>
    export let board = Array(10).fill(Array(10));
</script>

<div class="board">
    {#each board as row, i}
        <div class="row">
            {#each row as color}
                <div class="cell" data-color={color} />
            {/each}
            <div class="num">{i}</div>
        </div>
    {/each}
    <div class="row">
        {#each board[0] as _, i}
            <div class="num">{i}</div>
        {/each}
    </div>
</div>

<style>
    .row {
        display: flex;
        flex-direction: row;
        margin-bottom: 0.2em;
    }

    .row:last-child {
        margin-bottom: 0;
    }

    .cell {
        width: 1.3em;
        height: 1.3em;
        border: 1px solid gray;
        margin-left: 0.2em;
    }

    .num {
        margin-left: 0.2em;
        width: 1.3em;
        height: 1.3em;
        color: #333;
        display: flex;
        justify-content: center;
        align-items: center;
    }
</style>
