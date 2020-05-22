<script>
import { Editor, EditorContent, EditorMenuBar } from 'tiptap'
import {
  Blockquote,
  CodeBlock,
  HardBreak,
  Heading,
  OrderedList,
  BulletList,
  ListItem,
  TodoItem,
  TodoList,
  Bold,
  Code,
  Italic,
  Link,
  Table,
  TableHeader,
  TableCell,
  TableRow,
  Strike,
  Underline,
  History,
} from 'tiptap-extensions'
export default {
  components: {
    EditorContent,
    EditorMenuBar,
  },
  data() {
    return {
      editor: new Editor({
        extensions: [
          new Blockquote(),
          new BulletList(),
          new CodeBlock(),
          new HardBreak(),
          new Heading({ levels: [1, 2, 3] }),
          new ListItem(),
          new OrderedList(),
          new TodoItem(),
          new TodoList(),
          new Link(),
          new Bold(),
          new Code(),
          new Italic(),
          new Strike(),
          new Underline(),
          new History(),
          new Table(),
          new TableHeader(),
          new TableCell(),
          new TableRow(),
        ],
        content: `
            <h2>
              Tables
            </h2>
            <p>
              Tables come with some useful commands like adding, removing or merging rows and columns. Navigate with <code>tab</code> or arrow keys. Resizing is also supported.
            </p>
            <table>
              <tr>
                <th colspan="3" data-colwidth="100,0,0">Wide header</th>
              </tr>
              <tr>
                <td>One</td>
                <td>Two</td>
                <td>Three</td>
              </tr>
              <tr>
                <td>Four</td>
                <td>Five</td>
                <td>Six</td>
              </tr>
            </table>
          `,
      }),
    }
  },
  beforeDestroy() {
    this.editor.destroy()
  },
}
</script>

<template>
  <div class="editor">
    <EditorMenuBar v-slot="{ commands, isActive }" :editor="editor">
      <div class="menubar">
        <div class="toolbar">
          <button class="menubar__button" @click="commands.undo">
            <Icon name="undo" />
          </button>

          <button class="menubar__button" @click="commands.redo">
            <Icon name="redo" />
          </button>

          <button
            class="menubar__button"
            :class="{ 'is-active': isActive.bold() }"
            @click="commands.bold"
          >
            <Icon name="bold" />
          </button>

          <button
            class="menubar__button"
            :class="{ 'is-active': isActive.italic() }"
            @click="commands.italic"
          >
            <Icon name="italic" />
          </button>

          <button
            class="menubar__button"
            :class="{ 'is-active': isActive.strike() }"
            @click="commands.strike"
          >
            <Icon name="strike" />
          </button>

          <button
            class="menubar__button"
            :class="{ 'is-active': isActive.underline() }"
            @click="commands.underline"
          >
            <Icon name="underline" />
          </button>

          <button
            class="menubar__button"
            :class="{ 'is-active': isActive.code() }"
            @click="commands.code"
          >
            <Icon name="code" />
          </button>

          <button
            class="menubar__button"
            :class="{ 'is-active': isActive.paragraph() }"
            @click="commands.paragraph"
          >
            <Icon name="paragraph" />
          </button>

          <button
            class="menubar__button"
            :class="{ 'is-active': isActive.heading({ level: 1 }) }"
            @click="commands.heading({ level: 1 })"
          >
            H1
          </button>

          <button
            class="menubar__button"
            :class="{ 'is-active': isActive.heading({ level: 2 }) }"
            @click="commands.heading({ level: 2 })"
          >
            H2
          </button>

          <button
            class="menubar__button"
            :class="{ 'is-active': isActive.heading({ level: 3 }) }"
            @click="commands.heading({ level: 3 })"
          >
            H3
          </button>

          <button
            class="menubar__button"
            :class="{ 'is-active': isActive.bullet_list() }"
            @click="commands.bullet_list"
          >
            <Icon name="ul" />
          </button>

          <button
            class="menubar__button"
            :class="{ 'is-active': isActive.ordered_list() }"
            @click="commands.ordered_list"
          >
            <Icon name="ol" />
          </button>

          <button
            class="menubar__button"
            :class="{ 'is-active': isActive.blockquote() }"
            @click="commands.blockquote"
          >
            <Icon name="quote" />
          </button>

          <button
            class="menubar__button"
            :class="{ 'is-active': isActive.code_block() }"
            @click="commands.code_block"
          >
            <Icon name="code" />
          </button>

          <button
            class="menubar__button"
            @click="
              commands.createTable({
                rowsCount: 3,
                colsCount: 3,
                withHeaderRow: false,
              })
            "
          >
            <Icon name="table" />
          </button>

          <span v-if="isActive.table()">
            <button class="menubar__button" @click="commands.deleteTable">
              <Icon name="delete_table" />
            </button>
            <button class="menubar__button" @click="commands.addColumnBefore">
              <Icon name="add_col_before" />
            </button>
            <button class="menubar__button" @click="commands.addColumnAfter">
              <Icon name="add_col_after" />
            </button>
            <button class="menubar__button" @click="commands.deleteColumn">
              <Icon name="delete_col" />
            </button>
            <button class="menubar__button" @click="commands.addRowBefore">
              <Icon name="add_row_before" />
            </button>
            <button class="menubar__button" @click="commands.addRowAfter">
              <Icon name="add_row_after" />
            </button>
            <button class="menubar__button" @click="commands.deleteRow">
              <Icon name="delete_row" />
            </button>
            <button class="menubar__button" @click="commands.toggleCellMerge">
              <Icon name="combine_cells" />
            </button>
          </span>
        </div>
      </div>
    </EditorMenuBar>

    <EditorContent class="editor__content" :editor="editor" />
  </div>
</template>

<style lang="scss" module></style>
