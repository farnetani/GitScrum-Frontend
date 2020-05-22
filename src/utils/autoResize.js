export default {
methods: {
    resize(event) {
        event.target.style.height = "auto";
        event.target.style.height = `${event.target.scrollHeight}px`;
    }
},
mounted() {
    this.$nextTick(() => {
        this.$el.setAttribute("style", "height", `${this.$el.scrollHeight}px`);
    });
}
};
  