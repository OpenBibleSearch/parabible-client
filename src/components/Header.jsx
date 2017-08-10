import React from 'react'
import { CommandBar } from 'office-ui-fabric-react'
import DataFlow from 'util/DataFlow'
import ApiRequest from 'util/ApiRequest'
import bookDetails from "data/bookDetails"

class ParabibleHeader extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			invert: false,
			screenSizeIndex: DataFlow.get("screenSizeIndex"),
			reference: DataFlow.get("reference")
		}
		DataFlow.watch("reference", (r) => {
			this.setState({"reference": r})
		}).watch("screenSizeIndex", (n) => {
			this.setState({ "screenSizeIndex": n })
		})
	}
	generateTermMenuItem({ key, text, inverted }) {
		let menuItem = {
			key: key,
			name: text,
			subMenuProps: {
				items: [{
					key: 'edit',
					name: 'Modify',
					iconProps: {
						iconName: 'Edit'
					},
					onClick: () => {
						console.log("Modify!!!")
					}
				}, {
					key: 'invert',
					name: 'Invert',
					iconProps: {
						iconName: inverted ? "CheckboxComposite" : "Checkbox"
					},
					onClick: () => {
						let st = DataFlow.get("searchTerms")
						const index = st.findIndex(st => st.uid === key)
						st[index].inverted = !st[index].inverted
						DataFlow.set("searchTerms", st)
						this.forceUpdate()
					}
				}, {
					key: 'delete',
					name: 'Remove',
					iconProps: {
						iconName: 'Trash',
						style: {
							color: 'red'
						}
					},
					onClick: () => {
						let st = DataFlow.get("searchTerms")
						const index = st.findIndex(st => st.uid === key)
						delete st[index]
						DataFlow.set("searchTerms", st)
						this.forceUpdate()
					}
				}]
			}
		}
		if (/[\u0590-\u05fe]/.test(text))
			menuItem["style"] = { fontSize: "x-large", fontFamily: "SBL Biblit" }
		return menuItem
	}

	moveChapter(direction) {
		var referenceArray = bookDetails.reduce((previousValue, currentValue) => {
			var newReferences = [...Array(currentValue.chapters).keys()].map((i) => ({ "book": currentValue.name, "chapter": i + 1 }))
			return previousValue.concat(newReferences)
		}, [])
		var curr_ref = DataFlow.get("reference")
		var index = referenceArray.findIndex((item) => item.chapter == curr_ref.chapter && item.book == curr_ref.book)
		var newIndex = index + direction
		newIndex = newIndex >= 0 ? newIndex : referenceArray.length - 1
		newIndex = newIndex < referenceArray.length ? newIndex : 0

		DataFlow.set("reference", referenceArray[newIndex])
	}

	render() {
		let nearItemList = [{
				key: 'previousChapter',
				name: "",
				iconProps: {
					iconName: 'ChevronLeftSmall'
				},
				onClick: () => this.moveChapter(-1)
			}, {
				key: 'location',
				name: this.state.reference ? this.state.reference.book + " " + this.state.reference.chapter : "Select a chapter",
				style: { fontWeight: "bold", fontSize: "large" },
				iconProps: {
					iconName: 'Dictionary',
					style: {
						color: 'black'
					}
				},
				onClick: this.props.showPanel
			}, {
				key: 'nextChapter',
				name: "",
				iconProps: {
					iconName: 'ChevronRightSmall'
				},
				onClick: () => this.moveChapter(1)
			}
		]

		const searchTerms = DataFlow.get("searchTerms")
		const searchTermMenuItems = searchTerms.map(st => this.generateTermMenuItem({
			key: st.uid, 
			text: st.data.voc_utf8,
			inverted: st.inverted
		}))

		const searchRangeItems = [
			{
				key: 'phrase',
				name: 'Phrase',
			}, {
				key: 'clause',
				name: 'Clause',
			}, {
				key: 'sentence',
				name: 'Sentence',
			}, {
				key: 'verse',
				name: 'Verse',
			}
		]
		const searchTypeItems = [
			{
				key: 'normal',
				name: 'Normal',
			}, {
				key: 'collocation',
				name: 'Collocation',
			}, {
				key: 'wordStudy',
				name: 'Word Study',
			}
		]
		const searchFilterItems = [
			{
				key: 'none',
				name: 'None',
			}, {
				key: 'current',
				name: 'Current',
			}, {
				key: 'pentateuch',
				name: 'Pentateuch',
			}, {
				key: 'minorProphets',
				name: 'Minor Prophets',
			}, {
				key: 'custom',
				name: 'Custom',
			}
		]
		const searchSettingsItems = [
			{
				key: 'searchRange',
				name: 'Search Range',
				iconProps: {
					iconName: "Switcher"
				},
				subMenuProps: { items: searchRangeItems }
			}, {
				key: 'searchType',
				name: 'Search Type',
				iconProps: {
					iconName: "Library"
				},
				subMenuProps: { items: searchTypeItems }
			}, {
				key: 'searchFilter',
				name: 'Search Filter',
				iconProps: {
					iconName: "Filter"
				},
				subMenuProps: { items: searchFilterItems }
			}
		]
		const generalSettingsItems = [
			{
				key: 'fontSettings',
				name: 'Font Settings',
				iconProps: {
					iconName: "Font"
				}
			}, {
				key: 'textSettings',
				name: 'Text Settings', //Parallel View? Syntax Diagram? Highlight Search Terms?
				iconProps: {
					iconName: "ListMirrored"
				},
				subMenuProps: { "items": [
					{
						key: 'highlight',
						name: 'Highlight Terms',
						iconProps: {
							iconName: this.state.invert ? "CheckboxComposite" : "Checkbox"
						},
						onClick: () => {
							this.setState({ invert: !this.state.invert })
							console.log(this.state.invert)
						}
					}
				]}
			}, {
				key: 'morphologySettings',
				name: 'Morphology Settings', //Which fields to show
				iconProps: {
					iconName: "GroupedList"
				}
			}
		]

		const searchMenuItem = {
			key: "search",
			name: this.state.screenSizeIndex < 2 || this.state.screenSizeIndex == 4 ? "Search" : "",
			icon: "Search"
		}
		const searchTermParentItem = {
			key: "searchTerms",
			name: this.state.screenSizeIndex < 2 ? "Search Terms" : "",
			icon: "CollapseMenu",
			subMenuProps: { items: searchTermMenuItems }
		}

		const rightItemList = [
			{
				key: "searchSettings",
				name: this.state.screenSizeIndex < 2 || this.state.screenSizeIndex == 4 ? "Search Settings" : "",
				icon: "Settings",
				subMenuProps: { items: searchSettingsItems }
			},
			{
				key: "generalSettings",
				name: this.state.screenSizeIndex < 2 || this.state.screenSizeIndex == 4 ? "Options" : "",
				icon: "PlayerSettings",
				subMenuProps: { items: generalSettingsItems }
			},
			//  {
			// 	key: 'about',
			// 	name: 'About',
			// 	iconProps: {
			// 		iconName: "Info"
			// 	}
			// }, {
			// 	key: 'help',
			// 	name: 'Help',
			// 	iconProps: {
			// 		iconName: "Lifesaver"
			// 	}
			// }
		]

		var farItemList = {}
		switch (this.state.screenSizeIndex) {
			case 0:
			case 1:
				farItemList = [{
					key: "faritems",
					name: "",
					icon: "Waffle",
					subMenuProps: { items: [
						searchMenuItem,
						searchTermParentItem,
						...rightItemList
					]}
				}]
				if (searchTerms.length === 0)
					farItemList[0].subMenuProps.items.splice(1, 1)
				break;
			case 2:
				farItemList = [
					searchMenuItem,
					searchTermParentItem,
					...rightItemList
				]
				if (searchTerms.length === 0)
					farItemList.splice(1, 1)
				break;
			case 3:
				farItemList = [
					searchMenuItem,
					...searchTermMenuItems,
					...rightItemList
				]
				break;
			case 4:
				farItemList = [
					searchMenuItem,
					...searchTermMenuItems,
					...rightItemList
				]
				break;
		}

		return <CommandBar
			isSearchBoxVisible={false}
			items={nearItemList}
			farItems={farItemList}
		/>
	}
}

export default ParabibleHeader