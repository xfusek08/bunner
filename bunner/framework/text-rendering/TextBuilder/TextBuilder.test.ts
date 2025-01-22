import { describe, expect, test } from "bun:test";
import TextBuilder from "./TextBuilder";

describe("Text Builder Tests", () => {
    test("indentation", () => {
        const tb = new TextBuilder();
        tb.line('Hello, world!');
        tb.line();
        tb.indent()
        tb.line('Hello, world! indented');
        tb.unindent();
        tb.line();
        tb.line('Hello, world!');
        tb.line();
        expect(tb.render()).toBe([
            'Hello, world!',
            '',
            '    Hello, world! indented',
            '',
            'Hello, world!',
            '',
        ].join("\n"));
    });
    
    // test("simple table", () => {
    //     const tb = new TextBuilder();
    //     tb.line("Table");
    //     tb.aligned(["asdasd", "qweqwe"]);
    //     const res = tb.render();
    //     console.log(res);
    //     expect(res).toBe([
    //         'Table',
    //         'asdasd qweqwe',
    //     ].join("\n"));
    // });
    
    test("table", () => {
        const w = 80;
        const tb = new TextBuilder({ width: w });
        tb.line('Hello, world!');
        tb.line('='.repeat(w));
        tb.aligned(["asdasd", "-", "qweqwe qweqwe qweqwe qweqwe qweqwe qweqwe ".repeat(3)]);
        tb.aligned(["qwe", "-", "qve xvsvd asveev ".repeat(10)]);
        
        const res = tb.render();
        console.log(res);
        expect(res).toBe([
            'Hello, world!',
            '================================================================================',
            'asdasd - qweqwe qweqwe qweqwe qweqwe qweqwe qweqwe qweqwe qweqwe qweqwe qweqwe  ',
            '         qweqwe qweqwe qweqwe qweqwe qweqwe qweqwe qweqwe qweqwe                ',
            'qwe    - qve xvsvd asveev qve xvsvd asveev qve xvsvd asveev qve xvsvd asveev qve',
            '         xvsvd asveev qve xvsvd asveev qve xvsvd asveev qve xvsvd asveev qve    ',
            '         xvsvd asveev qve xvsvd asveev                                          ',
        ].join("\n"));
    });
});