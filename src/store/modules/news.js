/**
 * @file home
 * @author huanghuiquan (huanghuiquan@baidu.com)
 */

import API from '@/api';
import * as types from '../mutation-types';

const menuTabsLocalDataKey = 'menuTabsLocalDataKey';
const otherMenuTabsLocalDataKey = 'otherMenuTabsLocalDataKey';
const defaultCategory = 'remen';

let menuTabs = [
    {
        text: '热点',
        value: defaultCategory
    },
    {
        text: '娱乐',
        value: 'yule'
    },
    {
        text: '体育',
        value: 'tiyu'
    },
    {
        text: '军事',
        value: 'junshi'
    },
    {
        text: '社会',
        value: 'shehui'
    },
    {
        text: '汽车',
        value: 'qiche'
    },
    {
        text: '国内',
        value: 'guonei'
    },
    {
        text: '国际',
        value: 'guoji'
    },
    {
        text: '美女',
        value: 'meinv'
    }
];

let otherMenuTabs = [
    {
        text: '视频',
        value: 'shipin'
    },
    {
        text: '科技',
        value: 'keji'
    },
    {
        text: '财经',
        value: 'caijing'
    },
    {
        text: '动漫',
        value: 'dongman'
    }
];

function setLocalMenuTabsData(menuTabsKey = menuTabsLocalDataKey, menuTabsData) {
    localStorage.setItem(menuTabsKey, JSON.stringify(menuTabsData));
}

function getLocalMenuTabsData(menuTabsKey = menuTabsLocalDataKey) {
    let localData = localStorage.getItem(menuTabsKey);
    let res;

    try {
        res = JSON.parse(localData);
    }
    catch (err) {
        return;
    }
    return res;
}

menuTabs = getLocalMenuTabsData(menuTabsLocalDataKey) || menuTabs;
otherMenuTabs = getLocalMenuTabsData(otherMenuTabsLocalDataKey) || otherMenuTabs;

export default {
    state: {
        loaded: false,
        newsList: [],
        topicList: [],
        bannerList: [],
        newsDetail: {},
        category: '',
        lastListLen: 0,
        menuTabs,
        preview: {
            show: false,
            images: []
        },
        otherMenuTabs
    },
    getters: {
        loaded(state) {
            return state.loaded;
        },
        newsList(state) {
            return state.newsList;
        },
        topicList(state) {
            return state.topicList;
        },
        bannerList(state) {
            return state.bannerList;
        },
        category(state) {
            return state.category;
        },
        newsDetail(state) {
            return state.newsDetail;
        },
        lastListLen(state) {
            return state.lastListLen;
        },
        menuTabs(state) {
            return state.menuTabs;
        },
        preview(state) {
            return state.preview;
        },
        otherMenuTabs(state) {
            return state.otherMenuTabs;
        }
    },
    actions: {
        async getNewsList({commit}, params) {
            commit(types.SET_NEWS_ACTIVE_TAB, params.category);
            try {
                let {news, banner, topic} = await API.getNewsList(params);
                commit(types.SET_NEWS_LIST, {news, banner, topic, change: params.change});
            }
            catch (e) {
                console.log(e);
            }
        },
        async getNewsDetail({commit, state}, {nid}) {
            let {bannerList = [], topicList = [], newsList = []} = state;
            let list = [...bannerList, ...topicList, ...newsList];
            commit(types.SET_NEWS_DETAIL, list.find(item => item.nid === nid));
        },
        showPreview({commit, state}, item) {
            let images = item.imageurls.map(image => ({src: image.url}));
            commit(types.SET_PREVIEW_DATA, {show: true, images: images});
        },
        closePreview({commit, state}) {
            commit(types.SET_PREVIEW_DATA, {show: false});
        },
        [types.ADD_CATEGORY]({commit}, {value: category}) {
            commit(types.ADD_CATEGORY, category);
        },
        [types.DEL_CATEGORY]({commit}, tabItem) {
            commit(types.DEL_CATEGORY, tabItem.value);
        }
    },
    mutations: {
        [types.SET_NEWS_LIST](state, {news, topic, banner, change}) {
            let df = t => {
                let date = new Date(parseInt(t, 10) || Date.now());
                return date.toISOString()
                    .replace('T', ' ')
                    .substr(0, 16);
            };

            // let content = [];

            let dataProcess = item => {
                item.show = df(item.ts);
                // if (!content.length && item.content.length) {
                //     content = item.content;
                // }
                // item.content = item.content.length ? item.content : content;
                return item;
            };

            news = news.filter(item => item.content.length).map(dataProcess);

            if (topic) {
                topic = topic.filter(item => item.content.length).map(dataProcess);
            }

            banner = banner.filter(item => item.content.length).map(dataProcess);
            state.lastListLen = state.newsList.length;

            if (news && news.length) {
                if (change) {
                    state.newsList = news;
                }
                else {
                    state.newsList = [...state.newsList, ...news];
                }
                state.loaded = 'loaded';
            }
            else {
                state.loaded = 'complete';
            }

            state.topicList = topic;
            state.bannerList = banner;
        },
        [types.SET_NEWS_DETAIL](state, newsDetail) {
            state.newsDetail = newsDetail;
        },
        [types.SET_NEWS_ACTIVE_TAB](state, category) {
            state.menuTabs = state.menuTabs.map(item => {
                item.active = category === item.value;
                return item;
            });
        },
        [types.SET_PREVIEW_DATA](state, data) {
            state.preview = Object.assign(state.preview, data);
        },
        [types.DEL_CATEGORY](state, category) {
            state.menuTabs.forEach((item, index) => {
                if (category === item.value) {
                    let deletedCategoryObj = state.menuTabs.splice(index, 1)[0];
                    state.otherMenuTabs.unshift(deletedCategoryObj);
                    setLocalMenuTabsData(otherMenuTabsLocalDataKey, state.otherMenuTabs);
                }
            });
            setLocalMenuTabsData(menuTabsLocalDataKey, state.menuTabs);
        },
        [types.ADD_CATEGORY](state, category) {
            state.otherMenuTabs.forEach((item, index) => {
                if (category === item.value) {
                    let deletedCategoryObj = state.otherMenuTabs.splice(index, 1)[0];
                    state.menuTabs.push(deletedCategoryObj);
                    setLocalMenuTabsData(menuTabsLocalDataKey, state.menuTabs);
                }
            });
            setLocalMenuTabsData(otherMenuTabsLocalDataKey, state.otherMenuTabs);
        }
    }
};