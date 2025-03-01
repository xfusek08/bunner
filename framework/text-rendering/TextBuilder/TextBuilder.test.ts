import { describe, expect, test } from 'bun:test';

import TextBuilder from './TextBuilder';

describe('Text Builder Tests', () => {
    test('indentation', () => {
        const tb = new TextBuilder();
        tb.line('Hello, world!');
        tb.line();
        tb.indent();
        tb.line('Hello, world! indented');
        tb.unindent();
        tb.line();
        tb.line('Hello, world!');
        tb.line();
        expect(tb.render()).toBe(
            [
                'Hello, world!',
                '',
                '    Hello, world! indented',
                '',
                'Hello, world!',
                '',
            ].join('\n'),
        );
    });

    test('table', () => {
        const w = 80;
        const tb = new TextBuilder({ width: w });
        tb.line('Hello, world!');
        tb.line('='.repeat(w));
        tb.aligned([
            'asdasd',
            '-',
            'qweqwe qweqwe qweqwe qweqwe qweqwe qweqwe '.repeat(3),
        ]);
        tb.aligned(['qwe', '-', 'qve xvsvd asveev '.repeat(10)]);

        const a = tb.render();
        expect(a).toBe(
            [
                'Hello, world!',
                '================================================================================',
                'asdasd - qweqwe qweqwe qweqwe qweqwe qweqwe qweqwe qweqwe qweqwe qweqwe qweqwe',
                '         qweqwe qweqwe qweqwe qweqwe qweqwe qweqwe qweqwe qweqwe',
                'qwe    - qve xvsvd asveev qve xvsvd asveev qve xvsvd asveev qve xvsvd asveev qve',
                '         xvsvd asveev qve xvsvd asveev qve xvsvd asveev qve xvsvd asveev qve',
                '         xvsvd asveev qve xvsvd asveev',
            ].join('\n'),
        );
    });
});

describe('Aligned Text Tests', () => {
    test('basic alignment - two columns', () => {
        const tb = new TextBuilder({ width: 40 });
        tb.aligned(['Column1', 'Column2']);
        tb.aligned(['Short', 'Text']);
        tb.aligned(['Longer Text', 'Short']);

        expect(tb.render()).toBe(
            [
                'Column1     Column2',
                'Short       Text',
                'Longer Text Short',
            ].join('\n'),
        );
    });

    test('alignment with indentation', () => {
        const tb = new TextBuilder({ width: 40 });
        tb.line('Main section:');
        tb.indent();
        tb.aligned(['Key', 'Value']);
        tb.aligned(['Name', 'John Doe']);
        tb.aligned(['Email', 'john@example.com']);
        tb.unindent();
        tb.line('End section');

        expect(tb.render()).toBe(
            [
                'Main section:',
                '    Key   Value',
                '    Name  John Doe',
                '    Email john@example.com',
                'End section',
            ].join('\n'),
        );
    });

    test('alignment with text wrapping', () => {
        const tb = new TextBuilder({ width: 40 });
        tb.aligned([
            'Column1',
            'This is a very long text that should wrap nicely',
        ]);
        tb.aligned(['LongerColumn', 'Short text']);

        expect(tb.render()).toBe(
            [
                'Column1      This is a very long text',
                '             that should wrap nicely',
                'LongerColumn Short text',
            ].join('\n'),
        );
    });

    test('complex alignment with indent and wrap', () => {
        const tb = new TextBuilder({ width: 50 });
        tb.line('Section:');
        tb.indent();
        tb.aligned([
            'Property',
            '-',
            'This is a long description that should wrap across multiple lines while maintaining proper indentation',
        ]);
        tb.aligned(['Status', '-', 'Active']);
        tb.unindent();

        expect(tb.render()).toBe(
            [
                'Section:',
                '    Property - This is a long description that',
                '               should wrap across multiple lines',
                '               while maintaining proper',
                '               indentation',
                '    Status   - Active',
            ].join('\n'),
        );
    });

    test('edge cases', () => {
        const tb = new TextBuilder({ width: 40 });
        tb.aligned(['']); // Single empty column
        tb.aligned(['', '']); // Multiple empty columns
        tb.aligned(['A']); // Single character
        tb.aligned(['A', '', 'C']); // Mixed empty and non-empty

        expect(tb.render()).toBe(['', '', 'A', 'A  C'].join('\n'));
    });

    test('nested indentation with alignment', () => {
        const tb = new TextBuilder({ width: 50 });
        tb.line('Level 1:');
        tb.indent();
        tb.aligned(['A', 'First level']);
        tb.line('Nested:');
        tb.indent();
        tb.aligned([
            'B',
            'Second level with wrapping text that should go to next line',
        ]);
        tb.unindent();
        tb.aligned(['C', 'Back to first level']);
        tb.unindent();

        expect(tb.render()).toBe(
            [
                'Level 1:',
                '    A First level',
                '    Nested:',
                '        B Second level with wrapping text that',
                '          should go to next line',
                '    C Back to first level',
            ].join('\n'),
        );
    });
});

describe('Advanced Table Tests', () => {
    test('multi-column table with headers', () => {
        const tb = new TextBuilder({ width: 80 });
        tb.aligned(['ID', 'Name', 'Email', 'Role', 'Status']);
        tb.aligned(['1', 'John Smith', 'john@example.com', 'Admin', 'Active']);
        tb.aligned(['2', 'Jane Doe', 'jane@example.com', 'User', 'Pending']);

        expect(tb.render()).toBe(
            [
                'ID Name       Email            Role  Status',
                '1  John Smith john@example.com Admin Active',
                '2  Jane Doe   jane@example.com User  Pending',
            ].join('\n'),
        );
    });

    test('sparse table with missing values', () => {
        const tb = new TextBuilder({ width: 60 });
        tb.aligned(['Field', 'Value', 'Notes']);
        tb.aligned(['Name', 'John', '']);
        tb.aligned(['Address', '', '(not provided)']);
        tb.aligned(['Phone', '', '']);
        tb.aligned(['Email', 'john@example.com', 'primary']);

        expect(tb.render()).toBe(
            [
                'Field   Value            Notes',
                'Name    John',
                'Address                  (not provided)',
                'Phone',
                'Email   john@example.com primary',
            ].join('\n'),
        );
    });

    test('mixed content widths with alignment', () => {
        const tb = new TextBuilder({ width: 70 });
        tb.indent();
        tb.aligned([
            'Short',
            'A very long column header that wraps, a very long column header that wraps',
            'Med',
            'Last',
        ]);
        tb.aligned(['X', 'Small', 'Normal text', 'Right side']);

        expect(tb.render()).toBe(
            [
                '    Short A very long column      Med         Last',
                '          header that wraps, a',
                '          very long column header',
                '          that wraps',
                '    X     Small                   Normal text Right side',
            ].join('\n'),
        );
    });

    test('technical specification layout', () => {
        const tb = new TextBuilder({ width: 80 });
        tb.aligned([
            'Component',
            '|',
            'Version',
            '|',
            'License',
            '|',
            'Status',
        ]);
        tb.aligned(['React', '|', '18.2.0', '|', 'MIT', '|', 'Production']);
        tb.aligned([
            'TypeScript',
            '|',
            '5.0.4',
            '|',
            'Apache 2.0',
            '|',
            'Development',
        ]);
        tb.aligned(['webpack', '|', '5.80.0', '|', 'MIT', '|', 'Optional']);

        expect(tb.render()).toBe(
            [
                'Component  | Version | License    | Status',
                'React      | 18.2.0  | MIT        | Production',
                'TypeScript | 5.0.4   | Apache 2.0 | Development',
                'webpack    | 5.80.0  | MIT        | Optional',
            ].join('\n'),
        );
    });

    test('nested hierarchical data', () => {
        const tb = new TextBuilder({ width: 60 });
        tb.aligned(['Category', 'Items', 'Count']);
        tb.aligned(['Fruits', '', '']);
        tb.aligned(['', 'Apples', '5']);
        tb.aligned(['', 'Oranges', '3']);
        tb.aligned(['Vegetables', '', '']);
        tb.aligned(['', 'Carrots', '10']);
        tb.aligned(['', 'Potatoes', '8']);

        expect(tb.render()).toBe(
            [
                'Category   Items    Count',
                'Fruits',
                '           Apples   5',
                '           Oranges  3',
                'Vegetables',
                '           Carrots  10',
                '           Potatoes 8',
            ].join('\n'),
        );
    });

    test('column spans and separators', () => {
        const tb = new TextBuilder({ width: 70 });
        tb.aligned(['System Status Report', '', '', '']);
        tb.line('-'.repeat(70));
        tb.aligned(['Server', 'Status', 'Load', 'Uptime']);
        tb.aligned(['web-01', '✓', '48%', '99.9%']);
        tb.aligned(['web-02', '✓', '51%', '99.8%']);
        tb.line('-'.repeat(70));
        tb.aligned(['Summary:', 'All Systems Operational', '', '']);

        expect(tb.render()).toBe(
            [
                'System Status Report',
                '----------------------------------------------------------------------',
                'Server Status Load Uptime',
                'web-01 ✓      48%  99.9%',
                'web-02 ✓      51%  99.8%',
                '----------------------------------------------------------------------',
                'Summary: All Systems Operational',
            ].join('\n'),
        );
    });
});

describe('Colored Text Tests', () => {
    test('colored text in table', () => {
        const tb = new TextBuilder({ width: 70 });
        tb.aligned([
            'Status',
            '\x1b[32mONLINE\x1b[0m',
            '\x1b[33mPENDING\x1b[0m',
        ]);
        tb.aligned(['\x1b[31mERROR\x1b[0m', 'Details', 'More info']);

        expect(tb.render()).toBe(
            [
                'Status \x1b[32mONLINE\x1b[0m  \x1b[33mPENDING\x1b[0m',
                '\x1b[31mERROR\x1b[0m  Details More info',
            ].join('\n'),
        );
    });

    test('mixed colored and plain text with wrapping', () => {
        const tb = new TextBuilder({ width: 40 });
        tb.aligned([
            '\x1b[34mINFO\x1b[0m',
            'This is a very long text that contains some ' +
                '\x1b[31mcolored\x1b[0m words and should wrap properly',
        ]);

        expect(tb.render()).toBe(
            [
                '\x1b[34mINFO\x1b[0m This is a very long text that',
                '     contains some \x1b[31mcolored\x1b[0m words and',
                '     should wrap properly',
            ].join('\n'),
        );
    });
});
