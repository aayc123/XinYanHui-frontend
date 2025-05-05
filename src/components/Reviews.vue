<template>
  <div class="reviews-container">
    <div class="header">
      <button @click="filterTextOnly = !filterTextOnly">
        {{ filterTextOnly ? '展示所有评价' : '仅展示含文本评价' }}
      </button>
    </div>
    
    <div class="review-list">
      <div v-for="review in filteredReviews" :key="review.id" class="review-card">
        <div class="stars">{{ '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating) }}</div>
        <p class="review-text left-align" :class="{'no-text':!review.text}">
          {{ review.text || '来访者未填写文字评价' }}
        </p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      filterTextOnly: false,
      reviews: [
        { id: 1, rating: 5, text: '咨询师非常专业，解答了我的困惑！' },
        { id: 2, rating: 4, text: '' },
        { id: 3, rating: 3, text: '感觉还行，有帮助但不太深入。' }
      ]
    };
  },
  computed: {
    filteredReviews() {
      return this.filterTextOnly ? this.reviews.filter(r => r.text) : this.reviews;
    }
  }
};
</script>

<style scoped>
.reviews-container {
  padding: 20px;
}
.header {
  margin-bottom: 10px;
}
button {
  padding: 10px;
  border: none;
  background: #8B4513;
  color: white;
  cursor: pointer;
  border-radius: 5px;
}
.review-list {
  margin-top: 10px;
}
.review-card {
  padding: 15px;
  border-radius: 10px;
  background: #f5f5f5;
  margin-bottom: 10px;
}
.stars {
  font-size: 18px;
  color: gold;
}
.review-text {
  margin-top: 5px;
  text-align: left;
}
.no-text{
  color:#8B4513;
}
</style>
