// @vitest-environment nuxt
import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import PortfolioItem from '~/components/portfolio/PortfolioItem.vue'

const makeItem = (overrides: Partial<PortfolioItem> = {}): PortfolioItem => ({
    id: '1',
    title: 'Test Project',
    slug: 'test-project',
    url: '/proyectos/test-project',
    excerpt: 'A test project description',
    featuredImage: {
        id: '1',
        src: '/test.jpg',
        alt: 'Test image',
        width: 800,
        height: 600,
    },
    taxonomies: {
        projectCategories: [{ slug: 'web', name: 'Web' }],
        tecnologias: [{ slug: 'vue', name: 'Vue' }],
    },
    ...overrides,
})

describe('PortfolioItem', () => {
    it('renders the project title', async () => {
        const wrapper = await mountSuspended(PortfolioItem, {
            props: { item: makeItem() },
        })
        expect(wrapper.text()).toContain('Test Project')
    })

    it('renders as a NuxtLink with correct URL', async () => {
        const wrapper = await mountSuspended(PortfolioItem, {
            props: { item: makeItem() },
        })
        const link = wrapper.find('a')
        expect(link.exists()).toBe(true)
        expect(link.attributes('href')).toBe('/proyectos/test-project')
    })

    it('shows excerpt when showExcerpt is true', async () => {
        const wrapper = await mountSuspended(PortfolioItem, {
            props: {
                item: makeItem(),
                showExcerpt: true,
            },
        })
        expect(wrapper.text()).toContain('A test project description')
    })

    it('hides excerpt when showExcerpt is false', async () => {
        const wrapper = await mountSuspended(PortfolioItem, {
            props: {
                item: makeItem(),
                showExcerpt: false,
            },
        })
        expect(wrapper.text()).not.toContain('A test project description')
    })

    it('shows taxonomy badges when showTaxonomies is true', async () => {
        const wrapper = await mountSuspended(PortfolioItem, {
            props: {
                item: makeItem(),
                showTaxonomies: true,
                taxonomyToShow: 'projectCategories',
            },
        })
        expect(wrapper.text()).toContain('Web')
    })

    it('renders NuxtImg with correct src and alt', async () => {
        const wrapper = await mountSuspended(PortfolioItem, {
            props: { item: makeItem() },
        })
        const img = wrapper.find('img')
        expect(img.exists()).toBe(true)
        expect(img.attributes('alt')).toBe('Test image')
    })
})
